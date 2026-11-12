import test from 'node:test';
import assert from 'node:assert/strict';
import { missionSchema, validateBody } from '../src/middleware/validate.js';
import { uploadDocument, uploadImage } from '../src/middleware/upload.js';

function runMulterFilter(multerInstance, file) {
  return new Promise((resolve) => {
    multerInstance.fileFilter({}, file, (err, accepted) => {
      resolve({ err, accepted: Boolean(accepted) });
    });
  });
}

test('missionSchema preserves certificates, dates, availableFrom, and nullable caseStudy', () => {
  const parsed = missionSchema.parse({
    title: 'Hackathon Finalist',
    slug: 'hackathon-finalist',
    type: 'hackathon',
    startDate: '2026-10-01',
    endDate: '2026-10-02',
    availableFrom: '2026-12-15',
    certificates: ['https://example.com/api/upload/documents/6732f0c0b810000000000001.pdf'],
    caseStudy: null,
    events: [
      {
        id: 'evt-1',
        certificates: ['https://drive.google.com/file/d/abc123/view'],
      },
    ],
  });

  assert.deepEqual(parsed.certificates, [
    'https://example.com/api/upload/documents/6732f0c0b810000000000001.pdf',
  ]);
  assert.equal(parsed.caseStudy, null);
  assert.equal(parsed.startDate, '2026-10-01');
  assert.equal(parsed.availableFrom, '2026-12-15');
  assert.equal(parsed.events[0].title, '');
  assert.equal(parsed.events[0].certificates.length, 1);
});

test('missionSchema accepts multi-hundred-char challenges paragraph', () => {
  const longChallenge =
    'Designing and developing a modular cross-platform mobile application within a 24-hour hackathon, organizing shared components and TypeScript contracts, coordinating development responsibilities across team members, and establishing a foundation for future video analysis, training analytics, and AI-powered coaching features.';
  const parsed = missionSchema.parse({
    title: 'Hackathon Mission',
    slug: 'hackathon-mission',
    type: 'hackathon',
    caseStudy: { challenges: [longChallenge], screenshots: [] },
  });
  assert.equal(parsed.caseStudy.challenges[0], longChallenge);
});

test('validateBody handles Zod v4 ZodError via issues without throwing on undefined errors.map', () => {
  const mw = validateBody(missionSchema);
  let statusCode = null;
  let body = null;
  let nextCalled = false;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };
  mw({ body: { title: 'Test', slug: 'Bad Slug', type: 'hackathon' } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.equal(body.success, false);
  assert.match(body.message, /slug/i);
  assert.ok(Array.isArray(body.errors) && body.errors.length > 0);
  assert.equal(body.errors[0].field, 'slug');
});

test('uploadDocument accepts standard, x-pdf, and .pdf octet-stream MIME types and rejects others', async () => {
  assert.equal(
    (await runMulterFilter(uploadDocument, { mimetype: 'application/pdf', originalname: 'cert.pdf' })).accepted,
    true,
  );
  assert.equal(
    (await runMulterFilter(uploadDocument, { mimetype: 'application/x-pdf', originalname: 'cert.pdf' })).accepted,
    true,
  );
  assert.equal(
    (await runMulterFilter(uploadDocument, { mimetype: 'application/octet-stream', originalname: 'cert.pdf' }))
      .accepted,
    true,
  );
  const bad = await runMulterFilter(uploadDocument, { mimetype: 'text/plain', originalname: 'notes.txt' });
  assert.equal(bad.accepted, false);
  assert.equal(bad.err.status, 415);
});

test('uploadImage accepts jpg/jpeg/png/webp/avif/gif and rejects pdf', async () => {
  assert.equal(
    (await runMulterFilter(uploadImage, { mimetype: 'image/jpg', originalname: 'shot.jpg' })).accepted,
    true,
  );
  assert.equal(
    (await runMulterFilter(uploadImage, { mimetype: 'image/png', originalname: 'shot.png' })).accepted,
    true,
  );
  const bad = await runMulterFilter(uploadImage, { mimetype: 'application/pdf', originalname: 'doc.pdf' });
  assert.equal(bad.accepted, false);
  assert.equal(bad.err.status, 415);
});

