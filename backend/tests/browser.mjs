import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as sleep } from 'node:timers/promises';
import assert from 'node:assert/strict';

export async function browserCheck({ email, password }) {
  const profile = await mkdtemp(join(tmpdir(), 'shinobi-chrome-'));
  const browser = spawn(
    process.env.CMS_BROWSER,
    [
      '--headless=new',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--no-first-run',
      '--disable-background-networking',
      '--remote-debugging-port=9587',
      '--user-data-dir=' + profile,
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  let socket;
  try {
    let page;
    for (let i = 0; i < 80 && !page; i++) {
      try {
        page = (await (await fetch('http://127.0.0.1:9587/json/list')).json()).find((p) => p.type === 'page');
      } catch {}
      await sleep(100);
    }
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => (socket.onopen = r));
    let sequence = 0;
    const pending = new Map(),
      errors = [];
    socket.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        pending.get(m.id)?.(m.result);
        pending.delete(m.id);
      }
      if (m.method === 'Runtime.exceptionThrown')
        errors.push(m.params.exceptionDetails.exception?.description);
    };
    const call = (method, params = {}) =>
      new Promise((resolve) => {
        const id = ++sequence;
        pending.set(id, resolve);
        socket.send(JSON.stringify({ id, method, params }));
      });
    const run = async (expression) => {
      const out = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (!out) return undefined;
      if (out.exceptionDetails)
        throw Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
      return out.result.value;
    };
    const check = async (expression) => {
      for (let i = 0; i < 100; i++) {
        if (await run('Boolean(' + expression + ')')) return;
        await sleep(120);
      }
      throw Error(
        'Browser check failed: ' + expression + ' ' + (await run('document.body.innerText.slice(0,200)')),
      );
    };
    const visit = async (path) => {
      await call('Page.navigate', { url: 'http://localhost:5179' + path });
      await sleep(175);
    };
    const size = (width, height) =>
      call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await call('Runtime.enable');
    await size(1440, 900);
    await visit('/admin/projects');
    await check("location.pathname==='/admin/login' && document.querySelector('#email')");
    const login = async (p) => {
      await run(
        `(()=>{for(const [id,val] of Object.entries(${JSON.stringify({ email, password: p })})){const el=document.getElementById(id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}))}document.querySelector('form').requestSubmit()})()`,
      );
    };
    await login('incorrect');
    await check("document.body.innerText.includes('Invalid shinobi')");
    await login(password);
    await check("document.querySelector('.stat-value')?.textContent==='4'");
    const preview = await call('Page.captureScreenshot', { format: 'jpeg', quality: 76 });
    await writeFile(join(tmpdir(), 'shinobi-cms-overview.jpg'), Buffer.from(preview.data, 'base64'));
    for (const width of [1440, 1280, 1024, 768, 390, 360]) {
      await size(width, 850);
      await sleep(180);
      assert.ok(
        await run(
          'document.documentElement.scrollWidth<=innerWidth && document.querySelector(".admin-content-area").scrollWidth<=document.querySelector(".admin-content-area").clientWidth+1',
        ),
        'Overview overflow ' + width,
      );
    }
    await run('document.querySelector(\'[aria-label="Toggle navigation"]\').click()');
    await check("document.querySelector('.drawer-open')");
    for (const path of [
      'projects',
      'missions',
      'skills',
      'profile',
      'contact',
      'media',
      'dialogues',
      'settings',
    ]) {
      await visit('/admin/' + path);
      await check("document.querySelector('.admin-page h1')");
      await sleep(450);
      for (const width of [1440, 1280, 1024, 768, 390, 360]) {
        await size(width, 850);
        await sleep(100);
        assert.ok(
          await run(
            'document.documentElement.scrollWidth<=innerWidth && document.querySelector(".admin-content-area").scrollWidth<=document.querySelector(".admin-content-area").clientWidth+1',
          ),
          path + ' overflow at ' + width,
        );
      }
    }
    await size(1280, 850);
    await visit('/admin/projects?new');
    await check("document.querySelector('.admin-modal-dialog')");
    for (const width of [1440, 1280, 1024, 768, 390, 360]) {
      await size(width, 850);
      await sleep(100);
      assert.ok(
        await run(
          'document.querySelector(".admin-modal-dialog").getBoundingClientRect().right<=innerWidth && document.querySelector(".admin-modal-dialog").getBoundingClientRect().left>=0',
        ),
        'project editor width ' + width,
      );
    }
    await size(1280, 850);
    const write = async (selector, value) =>
      run(
        `(()=>{const el=document.querySelector(${JSON.stringify(selector)});const prototype=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}))})()`,
      );
    for (const [selector, value] of [
      ['#projectsadmin-project-title', 'Browser test'],
      ['#projectsadmin-slug-url-identifier', 'browser-test'],
      ['#projectsadmin-ramen-dish-name-theme', 'Browser ramen'],
      ['[id^="projectsadmin-project-photo"]', '/missions/ds-photography.webp'],
      ['[id^="projectsadmin-short-description"]', 'Browser description'],
    ])
      await write(selector, value);
    await run("document.querySelector('.admin-modal-body').requestSubmit()");
    await check(
      "!document.querySelector('.admin-modal-dialog') && document.querySelector('tbody')?.textContent.includes('Browser test')",
    );
    await visit('/admin/projects?edit=browser-test');
    await check("document.querySelector('#projectsadmin-project-title')?.value==='Browser test'");
    await write('#projectsadmin-project-title', 'Browser edited');
    await run("document.querySelector('.admin-modal-body').requestSubmit()");
    await check(
      "!document.querySelector('.admin-modal-dialog') && document.querySelector('tbody')?.textContent.includes('Browser edited')",
    );
    await run(
      "window.confirm=()=>true;[...document.querySelectorAll('tr')].find(r=>r.textContent.includes('Browser edited')).querySelector('[title=\"Delete Project\"]').click()",
    );
    await check(
      "!document.querySelector('tbody')?.textContent.includes('Browser edited') && document.body.innerText.includes('deleted')",
    );
    console.log('PASS create, edit, reload and delete through project editor');
    console.log(
      'PASS real browser login, reload, all admin routes, project editor and overview at six widths',
    );
    await visit('/');
    await check(
      "document.querySelector('canvas') || [...document.querySelectorAll('button')].some(b=>b.textContent.includes('2D'))",
    );
    await check("document.querySelector('.shinobi-nav-item')");
    await run(
      "[...document.querySelectorAll('.shinobi-nav-item')].find(b=>b.textContent.includes('Projects')).click()",
    );
    await check("document.querySelector('.cover-open-trigger-btn')");
    await run("document.querySelector('.cover-open-trigger-btn').click()");
    await check(
      "document.querySelector('.book-interior-spread:not([inert])') && document.querySelector('.project-detail')?.textContent.includes('Published audit project')",
    );
    await check(
      "[...document.querySelectorAll('[data-spread=\"1\"] button')].some(b=>b.textContent.includes('Next Page') && !b.disabled)",
    );
    await run(
      "[...document.querySelectorAll('[data-spread=\"1\"] button')].find(b=>b.textContent.includes('Next Page')).click()",
    );
    await check('document.querySelector(\'[data-spread="2"][aria-hidden=false]\')');
    console.log('PASS 3D navigation, published ramen menu, cover opening and page turn');
    await visit('/');
    await check("document.querySelector('.shinobi-nav-item')");
    await run(
      "[...document.querySelectorAll('.shinobi-nav-item')].find(b=>b.textContent.includes('Missions')).click()",
    );
    await check("document.querySelector('.ms-close')");
    await sleep(1300);
    await run("document.querySelector('.ms-close').click()");
    await check(
      "[...document.querySelectorAll('.rpg-interaction-layer button')].some(b=>b.textContent.includes('Sasuke'))",
    );
    await run(
      "[...document.querySelectorAll('.rpg-interaction-layer button')].find(b=>b.textContent.includes('Sasuke')).click()",
    );
    await check("document.body.innerText.includes('Audit conversation')");
    console.log('PASS published NPC dialogue through village proximity control');
    await visit('/');
    await check(
      "[...document.querySelectorAll('button')].some(b=>(b.title+' '+b.textContent+' '+b.getAttribute('aria-label')).includes('2D')) || document.querySelector('.p2d-root')",
    );
    await run(
      "if(!document.querySelector('.p2d-root')) [...document.querySelectorAll('button')].find(b=>(b.title+' '+b.textContent+' '+b.getAttribute('aria-label')).includes('2D'))?.click()",
    );
    await check("document.querySelector('.p2d-root') && document.body.innerText.includes('Audit profile')");
    await check(
      "document.body.innerText.includes('Audit skill') && document.body.innerText.includes('Audit experience')",
    );
    await run("document.querySelector('.cover-open-trigger-btn').click()");
    await check(
      "document.querySelector('.book-interior-spread:not([inert])') && document.querySelector('.project-detail')?.textContent.includes('Published audit project')",
    );
    await run(
      "document.querySelector('.contact-inquiry summary').click();const f=document.querySelector('.contact-inquiry form');f.elements.name.value='Browser';f.elements.email.value='browser@example.invalid';f.elements.message.value='Browser delivery';f.requestSubmit()",
    );
    await check("document.querySelector('.contact-inquiry').textContent.includes('Message delivered.')");
    assert.equal(errors.length, 0, errors.join(' | '));
    console.log('PASS published 2D profile, skills and missions with no uncaught browser exception');
  } finally {
    socket?.close();
    if (browser.exitCode === null) {
      const exit = once(browser, 'exit');
      browser.kill();
      await exit;
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
  }
}
