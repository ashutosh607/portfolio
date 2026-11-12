import test from 'node:test';
import assert from 'node:assert/strict';
import { isDocumentUrl, missionPreviewMedia } from '../src/data/missionMedia.js';

test('isDocumentUrl identifies PDF and document endpoints', () => {
  assert.equal(isDocumentUrl('https://cdn.example.com/cert.pdf'), true);
  assert.equal(isDocumentUrl('https://api.example.com/api/upload/documents/66f0abc'), true);
  assert.equal(isDocumentUrl('https://res.cloudinary.com/demo/raw/upload/v1/doc'), true);
  assert.equal(isDocumentUrl('https://drive.google.com/file/d/abc/view'), true);
  assert.equal(isDocumentUrl('https://res.cloudinary.com/demo/image/upload/v1/shot.png'), false);
});

test('missionPreviewMedia falls back from thumbnail to screenshots, certificates, and event certificates', () => {
  assert.deepEqual(
    missionPreviewMedia({
      thumbnail: '',
      caseStudy: { screenshots: ['https://cdn.example.com/shot.jpg'] },
      certificates: [],
      events: [],
    }),
    { imageUrl: 'https://cdn.example.com/shot.jpg', documentUrl: '' }
  );

  assert.deepEqual(
    missionPreviewMedia({
      thumbnail: '',
      caseStudy: { screenshots: [] },
      certificates: [{ url: 'https://cdn.example.com/cert.png', title: 'Cert' }],
      events: [],
    }),
    { imageUrl: 'https://cdn.example.com/cert.png', documentUrl: '' }
  );

  assert.deepEqual(
    missionPreviewMedia({
      thumbnail: '',
      caseStudy: { screenshots: [] },
      certificates: ['https://cdn.example.com/cert.pdf'],
      events: [{ certificates: [{ url: 'https://cdn.example.com/event-shot.webp' }] }],
    }),
    {
      imageUrl: 'https://cdn.example.com/event-shot.webp',
      documentUrl: 'https://cdn.example.com/cert.pdf',
    }
  );
});

test('missionPreviewMedia skips PDF thumbnail as raster image and exposes PDF documentUrl', () => {
  assert.deepEqual(
    missionPreviewMedia({
      thumbnail: 'https://api.example.com/api/upload/documents/123',
      caseStudy: { screenshots: [] },
      certificates: [],
      events: [],
    }),
    {
      imageUrl: '',
      documentUrl: 'https://api.example.com/api/upload/documents/123',
    }
  );
});
