import test from 'node:test';
import assert from 'node:assert/strict';
import { isDocumentUrl, missionPreviewMedia } from '../src/features/experience/utils/missionMedia.js';
import { projectDetailPhoto } from '../src/features/projects/data/projectMenu.js';
import { isWallBlocking } from '../src/features/village/systems/terrainCollider.js';

test('isWallBlocking blocks movement through street lamp cylinder obstacles at any speed', () => {
  const collider = {
    isSpatialCollider: true,
    minX: -50,
    maxX: 50,
    minZ: -50,
    maxZ: 50,
    cellSize: 2.5,
    cols: 40,
    rows: 40,
    groundCells: new Map(),
    wallCells: new Map(),
    groundTris: [],
    wallTris: [],
    obstacles: [
      { x: -19.5, z: 2.2, radiusSq: 0.34, minY: -1.5, maxY: 3.5 },
    ],
  };

  // Approaching the lamp post stops before entering its cylinder
  assert.equal(isWallBlocking(collider, -19.5, 0.75, 3.0, 0, -1, 0.6), true);

  // Large high-speed step that would otherwise jump across the lamp center is still blocked
  assert.equal(isWallBlocking(collider, -19.5, 0.75, 2.9, 0, -1, 1.4), true);

  // Walking parallel far away is not blocked
  assert.equal(isWallBlocking(collider, -17.0, 0.75, 2.2, 0, -1, 0.6), false);
});

test('projectDetailPhoto syncs custom frontPagePhoto over legacy seed projectPhoto', () => {
  assert.equal(
    projectDetailPhoto({
      id: 'travelflow-ai',
      frontPagePhoto: 'https://res.cloudinary.com/demo/image/upload/v1/travelflow-custom.png',
      projectPhoto: '/ramen-menu/travelflow-ai.svg',
    }),
    'https://res.cloudinary.com/demo/image/upload/v1/travelflow-custom.png'
  );

  assert.equal(
    projectDetailPhoto({
      id: 'wastewise',
      frontPagePhoto: '',
      projectPhoto: 'https://res.cloudinary.com/demo/image/upload/v1/wastewise-custom.png',
    }),
    'https://res.cloudinary.com/demo/image/upload/v1/wastewise-custom.png'
  );
});

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
