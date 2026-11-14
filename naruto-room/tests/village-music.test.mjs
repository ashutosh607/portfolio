import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareLoop, VillageMusic, villageTrack } from '../src/features/audio/villageMusic.js';

function createMockAudioBuffer(sampleRate = 1000, length = 2000) {
  const ch0 = new Float32Array(length);
  const ch1 = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    ch0[i] = i < 200 ? 1.0 : 0.2;
    ch1[i] = i < 200 ? -1.0 : -0.2;
  }
  return {
    sampleRate,
    length,
    numberOfChannels: 2,
    getChannelData(c) {
      return c === 0 ? ch0 : ch1;
    },
  };
}

test('prepareLoop blends loop tail into opening using complementary raised-cosine weights', () => {
  const buffer = createMockAudioBuffer(1000, 2000);
  const loop = prepareLoop(buffer, { start: 0, end: null, seam: 0.08 });

  assert.equal(loop.first, 0);
  assert.equal(loop.start, 0.08);
  assert.equal(loop.end, 2.0);

  const ch0 = buffer.getChannelData(0);
  // First sample of tail (weight = 0) stays at tail value (0.2)
  assert.ok(Math.abs(ch0[1920] - 0.2) < 1e-5);
  // Last sample of tail (weight = 1) matches end of opening blend (1.0)
  assert.ok(Math.abs(ch0[1999] - 1.0) < 1e-5);
});

test('VillageMusic starts off by default at 10% volume and clamps volume changes', () => {
  const music = new VillageMusic();
  assert.equal(music.snapshot().status, 'off');
  assert.equal(music.snapshot().volume, 0.1);
  assert.equal(music.enabled, false);

  music.setVolume(0.35);
  assert.equal(music.snapshot().volume, 0.35);

  music.setVolume(2.5);
  assert.equal(music.snapshot().volume, 1);

  music.setVolume(-0.4);
  assert.equal(music.snapshot().volume, 0);

  assert.equal(villageTrack.url, '/audio/konoha-ambience.ogg');
  assert.equal(villageTrack.fallbackUrl, '/audio/konoha-ambience.mp3');
});

