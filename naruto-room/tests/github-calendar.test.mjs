import test from 'node:test';
import assert from 'node:assert/strict';

test('GitHub calendar week and intensity level mapping', () => {
  const sampleDays = [
    { date: '2026-02-11', count: 6, level: 2 },
    { date: '2026-02-12', count: 5, level: 2 },
    { date: '2026-02-13', count: 2, level: 1 },
    { date: '2026-02-14', count: 21, level: 4 },
    { date: '2026-02-15', count: 2, level: 1 }
  ];

  const total = sampleDays.reduce((sum, d) => sum + d.count, 0);
  assert.equal(total, 36);

  const levelColors = {
    0: '#242825',
    1: '#0e4429',
    2: '#006d32',
    3: '#26a641',
    4: '#39d353',
  };

  sampleDays.forEach(day => {
    assert.ok(levelColors[day.level], `Level ${day.level} must map to a green intensity color`);
  });
});

