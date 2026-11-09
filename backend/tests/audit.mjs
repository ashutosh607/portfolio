// Opt-in integration audit. Uses an isolated Atlas database and tracks every cloud fixture.
import 'dotenv/config';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as sleep } from 'node:timers/promises';
import User from '../src/models/User.js';
import Asset from '../src/models/Asset.js';
import { deleteFromCloudinary } from '../src/config/cloudinary.js';
import { browserCheck } from './browser.mjs';

const database = 'shinobi_qa_' + randomBytes(8).toString('hex');
const uri = new URL(process.env.MONGO_URI);
uri.pathname = '/' + database;
const env = {
  ...process.env,
  MONGO_URI: uri.href,
  PORT: '5876',
  CLIENT_URL: 'http://localhost:5179',
  JWT_SECRET: randomBytes(32).toString('hex'),
  NODE_ENV: 'development',
};
const email = 'audit@example.invalid',
  password = randomUUID(),
  base = 'http://localhost:5876/api';
let server,
  cookie = '';
const children = [];
const start = (script, args = [], cwd = process.cwd(), extra = {}) => {
  const child = spawn(process.execPath, [script, ...args], {
    cwd,
    env: { ...env, ...extra },
    stdio: 'ignore',
    windowsHide: true,
  });
  children.push(child);
  return child;
};
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await sleep(200);
  }
  throw Error('Listener unavailable: ' + url);
}
async function api(path, method = 'GET', body, expected = 200, credential = cookie) {
  const headers = {};
  if (credential) headers.Cookie = credential;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch(base + path, { method, body, headers });
  const result = await response.json();
  assert.ok(
    [expected].flat().includes(response.status),
    method + ' ' + path + ' HTTP ' + response.status + ' ' + (result.message || ''),
  );
  return { result, cookie: response.headers.get('set-cookie') };
}
const data = async (...args) => (await api(...args)).result.data;
const snapshot = () => data('/portfolio', 'GET', undefined, 200, '');
async function stop(child) {
  if (child && child.exitCode === null && child.signalCode === null) {
    const ended = once(child, 'exit');
    child.kill();
    await ended;
  }
}
async function boot() {
  server = start('server.js');
  await ready(base + '/health');
  for (let i = 0; i < 50; i++) {
    if ((await (await fetch(base + '/health')).json()).database === 'connected') return;
    await sleep(150);
  }
  throw Error('Test database connection unavailable');
}
async function file(name, buffer, type, endpoint, status = 201) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), name);
  return data('/upload/' + endpoint, 'POST', form, status);
}
try {
  await mongoose.connect(uri.href, { serverSelectionTimeoutMS: 7000 });
  assert.equal(mongoose.connection.name, database);
  const user = await User.create({ email, password, name: 'CMS audit' });
  const imported = start('src/data/importVillage.js');
  assert.equal((await once(imported, 'exit'))[0], 0);
  await boot();
  for (const path of [
    '/contact?includeMessages=true',
    '/projects?all=true',
    '/skills?all=true',
    '/missions?all=true',
    '/dialogues?all=true',
    '/auth/me',
    '/system',
    '/overview',
    '/upload',
  ])
    await api(path, 'GET', undefined, 401, '');
  await api('/projects', 'POST', {}, 401, '');
  await api('/auth/login', 'POST', { email, password: 'wrong' }, 401, '');
  const login = await api('/auth/login', 'POST', { email, password });
  assert.match(login.cookie, /HttpOnly/);
  assert.match(login.cookie, /SameSite=Strict/);
  assert.ok(!login.result.token);
  cookie = login.cookie.split(';')[0];
  const expired = jwt.sign({ id: user.id, version: 0 }, env.JWT_SECRET, { expiresIn: -1 });
  await api('/auth/me', 'GET', undefined, 401, 'adminToken=' + expired);
  assert.equal((await api('/auth/me')).result.user.email, email);
  console.log('PASS private endpoints, invalid credentials, cookie login, session restore, expired token');
  const status = await data('/system');
  assert.equal(status.database, 'Online');
  assert.equal(status.media, 'Online');
  console.log('PASS live Atlas and Cloudinary pings');
  const project = {
    slug: 'audit-project',
    title: 'Audit project',
    category: 'Engineering',
    projectPhoto: '/missions/ds-photography.webp',
    shortDesc: 'Audit description',
    status: 'draft',
    techStack: ['React'],
  };
  await api('/projects', 'POST', project, 201);
  await api('/projects', 'POST', project, 409);
  await api('/projects/audit-project', 'GET', undefined, 404, '');
  assert.equal((await snapshot()).projects.length, 0);
  await api('/projects/audit-project', 'PUT', {
    title: 'Published audit project',
    dishName: 'Audit ramen',
    status: 'published',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    features: ['Audit feature'],
  });
  await api('/projects/reorder', 'POST', { items: [{ slug: project.slug, order: 4 }] });
  assert.equal((await snapshot()).projects[0].order, 4);
  await api('/projects/reorder', 'POST', { items: [{ slug: 'missing', order: 0 }] }, 409);
  await api(
    '/skills',
    'POST',
    {
      slug: 'audit-skill',
      title: 'Audit skill',
      icon: 'code',
      summary: 'First',
      relatedProjects: [project.slug],
    },
    201,
  );
  await api('/skills/audit-skill', 'PUT', { summary: 'Revised', technologies: ['React'] });
  await api('/skills/reorder', 'POST', { items: [{ slug: 'audit-skill', order: 2 }] });
  await api(
    '/missions',
    'POST',
    { slug: 'audit-mission', type: 'internship', title: 'Audit experience', visible: false },
    201,
  );
  await api('/missions/audit-mission', 'GET', undefined, 404, '');
  await api('/missions/audit-mission', 'PUT', {
    visible: true,
    organization: 'Audit organization',
    description: 'Published experience',
  });
  await api(
    '/missions',
    'POST',
    {
      slug: 'event-audit',
      title: 'Hackathon audit',
      type: 'hackathon',
      certificates: ['/audit.pdf'],
      events: [
        { id: 'round', title: 'Public round', date: '2026-11-09', achievement: 'Finalist' },
        { id: 'hidden', title: 'Private round', visible: false },
      ],
    },
    201,
  );
  assert.equal((await data('/missions/event-audit')).events.length, 1);
  assert.equal((await data('/missions?all=true')).find((m) => m.slug === 'event-audit').events.length, 2);
  await api('/missions/event-audit', 'DELETE');
  await api('/missions/reorder', 'POST', { items: [{ slug: 'audit-mission', order: 5 }] });
  const script = (await data('/dialogues?all=true')).find((d) => d.characterId === 'sasuke');
  script.dialogueSequence[0].text = 'Audit conversation';
  await api('/dialogues/' + script.characterId, 'PUT', script);
  await api('/profile', 'PUT', {
    about: {
      title: 'Audit profile',
      bioParagraphs: ['Audit biography'],
      snapshotItems: [{ title: 'Audit education' }],
    },
  });
  await api('/profile', 'PUT', { saveDraft: true, about: { title: 'Draft profile' } });
  assert.equal((await snapshot()).profile.about.title, 'Audit profile');
  assert.equal((await data('/profile?all=true')).draft.about.title, 'Draft profile');
  assert.ok(!(await data('/profile')).draft);
  await api('/contact', 'PUT', {
    email: 'qa@example.invalid',
    availabilityText: 'Fixture availability',
    description: 'Audit contact',
  });
  await api(
    '/contact/messages',
    'POST',
    { name: 'Audit visitor', email: 'visitor@example.invalid', message: 'Browser audit fixture' },
    201,
    '',
  );
  const inbox = await data('/contact?includeMessages=true');
  const id = inbox.messages[0]._id;
  assert.ok(!(await data('/contact')).messages);
  await api('/contact/messages/' + id, 'PATCH', { read: true });
  assert.equal((await data('/contact?includeMessages=true')).messages[0].read, true);
  await api('/contact/messages/' + id, 'PATCH', { read: false });
  console.log(
    'PASS projects, skills, missions, dialogue, profile, contact, unread state, publishing and ordering',
  );
  await file('fake.png', 'not a png', 'image/png', 'image', 415);
  await file('fake.pdf', 'not a pdf', 'application/pdf', 'document', 415);
  await file('big.png', Buffer.alloc(10 * 1024 * 1024 + 1), 'image/png', 'image', 413);
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC0kAAAAASUVORK5CYII=',
    'base64',
  );
  const asset = await file('audit.png', png, 'image/png', 'image');
  assert.equal((await fetch(asset.url)).status, 200);
  const replacement = await file('replacement.png', png, 'image/png', 'image');
  await api('/projects/audit-project', 'PUT', { projectPhoto: replacement.url });
  await api('/upload/' + replacement._id, 'DELETE', undefined, 409);
  await api('/projects/audit-project', 'PUT', { projectPhoto: asset.url });
  await api('/upload/' + replacement._id, 'DELETE');
  await api('/projects/audit-project', 'PUT', { frontPagePhoto: asset.url, screenshots: [asset.url] });
  await api('/upload/' + asset._id, 'DELETE', undefined, 409);
  const { readFile } = await import('node:fs/promises');
  const bundledPdf = await readFile(
    new URL('../../naruto-room/public/Ashutosh_Kadam_Resume.pdf', import.meta.url),
  );
  const pdf = await file('audit.pdf', bundledPdf, 'application/pdf', 'document', [201, 422]);
  if (pdf) {
    assert.equal((await fetch(pdf.url)).status, 200);
    console.log('PASS PDF delivery');
  } else console.log('BLOCKED Cloudinary public PDF delivery; upload rejected and rolled back');
  const resumeUrl = pdf?.url || '/Ashutosh_Kadam_Resume.pdf';
  await api('/contact', 'PUT', { resume: { activePdfUrl: resumeUrl, fileName: 'audit.pdf' } });
  if (pdf) await api('/upload/' + pdf._id, 'DELETE', undefined, 409);
  await stop(server);
  await boot();
  const live = await snapshot();
  assert.equal(live.contact.resume.activePdfUrl, resumeUrl);
  assert.equal(live.projects[0].screenshots[0], asset.url);
  assert.ok(!live.contact.messages);
  console.log(
    'PASS file validation, upload, image delivery, reference guard, API restart persistence and published snapshot',
  );
  for (let i = 1; i <= 3; i++)
    await api(
      '/projects',
      'POST',
      { ...project, slug: 'page-test-' + i, title: 'Page test ' + i, status: 'published', order: 5 + i },
      201,
    );
  if (process.env.CMS_BROWSER) {
    const siteDir = new URL('../../naruto-room/', import.meta.url);
    const { fileURLToPath } = await import('node:url');
    start(
      'node_modules/vite/bin/vite.js',
      ['--host', 'localhost', '--port', '5179', '--strictPort'],
      fileURLToPath(siteDir),
      { VITE_API_URL: base },
    );
    await ready('http://localhost:5179/admin');
    await browserCheck({ email, password });
  }
  for (let i = 1; i <= 3; i++) await api('/projects/page-test-' + i, 'DELETE');
  await api('/projects/audit-project', 'PUT', { status: 'draft' });
  assert.equal((await snapshot()).projects.length, 0);
  for (const [group, slug] of [
    ['projects', project.slug],
    ['skills', 'audit-skill'],
    ['missions', 'audit-mission'],
  ])
    await api('/' + group + '/' + slug, 'DELETE');
  const submitted = await data('/contact?includeMessages=true');
  if (process.env.CMS_BROWSER)
    assert.ok(submitted.messages.some((m) => m.email === 'browser@example.invalid'));
  await api('/contact/messages/' + id, 'DELETE');
  await api('/contact', 'PUT', { resume: { activePdfUrl: '/Ashutosh_Kadam_Resume.pdf' } });
  for (const item of [asset, pdf].filter(Boolean)) await api('/upload/' + item._id, 'DELETE');
  assert.equal((await data('/upload')).length, 0);
  await api('/auth/logout', 'POST');
  await api('/auth/me', 'GET', undefined, 401);
  for (let i = 0; i < 5; i++)
    await api('/auth/login', 'POST', { email, password: 'invalid' }, [401, 429], '');
  await api('/auth/login', 'POST', { email, password: 'invalid' }, 429, '');
  console.log('PASS deletion, unpublish, logout replay rejection and login throttling');
  await stop(server);
  env.NODE_ENV = 'production';
  await boot();
  const productionLogin = await api('/auth/login', 'POST', { email, password });
  assert.match(productionLogin.cookie, /; Secure/);
  const prodCookie = productionLogin.cookie.split(';')[0];
  await api(
    '/auth/change-password',
    'PUT',
    { currentPassword: password, newPassword: randomUUID() },
    200,
    prodCookie,
  );
  await api('/auth/me', 'GET', undefined, 401, prodCookie);
  console.log('PASS production Secure cookie and password-change revocation');
  await stop(server);
  env.MONGO_URI = 'mongodb://127.0.0.1:1/unreachable';
  server = start('server.js');
  await ready(base + '/health');
  await api('/portfolio', 'GET', undefined, 503, '');
  console.log('PASS unavailable database returns HTTP 503');
} finally {
  for (const child of children.reverse()) await stop(child);
  if (
    mongoose.connection.readyState === 1 &&
    mongoose.connection.name === database &&
    /^shinobi_qa_[a-f0-9]{16}$/.test(database)
  ) {
    for (const asset of await Asset.find()) await deleteFromCloudinary(asset.publicId, asset.resourceType);
    await mongoose.connection.dropDatabase();
    console.log('Removed isolated QA database and cloud fixtures');
  }
  await mongoose.disconnect();
}
