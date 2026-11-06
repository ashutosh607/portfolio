import test from 'node:test';
import assert from 'node:assert/strict';
import { sheetPoint } from '../src/components/PageTurnSurface.js';

test('sheet stays attached to its spine and settles flat on either side', () => {
  for (let frame = 0; frame <= 100; frame++) {
    const progress = frame / 100;
    for (const v of [-0.5, 0, 0.5]) {
      const point = sheetPoint(0, v, progress, 500, 650);
      assert.ok(Math.abs(point[0]) < 1e-9 && Math.abs(point[2]) < 1e-9);
    }
  }
  assert.deepEqual(sheetPoint(1, 0, 0, 500, 650), [500, 0, 0]);
  const end = sheetPoint(1, 0, 1, 500, 650);
  assert.ok(Math.abs(end[0] + 500) < 1e-7 && Math.abs(end[2]) < 1e-7);
});

test('moving paper is curved, continuous and finite across both turn directions', () => {
  const root = sheetPoint(0, 0, 0.3, 500, 650);
  const mid = sheetPoint(0.5, 0, 0.3, 500, 650);
  const edge = sheetPoint(1, 0, 0.3, 500, 650);
  const cross = (mid[0] - root[0]) * (edge[2] - root[2]) - (mid[2] - root[2]) * (edge[0] - root[0]);
  assert.ok(Math.abs(cross) > 1000, 'a curved page cannot be a rigid plane');
  for (const direction of [1, -1]) {
    let previous;
    for (let frame = 0; frame <= 200; frame++) {
      const progress = direction === 1 ? frame / 200 : 1 - frame / 200;
      const point = sheetPoint(1, 0.5, progress, 500, 650);
      assert.ok(point.every(Number.isFinite));
      assert.ok(point[2] >= 0, 'sheet must stay above the resting spread');
      if (previous) assert.ok(Math.hypot(...point.map((value, i) => value - previous[i])) < 15, 'no discontinuities');
      previous = point;
    }
  }
});
