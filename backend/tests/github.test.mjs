import test from 'node:test';
import assert from 'node:assert/strict';

test('GitHub calendar config endpoint returns valid structure', async () => {
  const res = await fetch('http://localhost:5000/api/github/config');
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.username, 'ashutosh607');
  assert.equal(typeof json.data.title, 'string');
  assert.equal(typeof json.data.subtitle, 'string');
  assert.equal(typeof json.data.description, 'string');
});

test('GitHub live contributions returns 12 months of real activity and caches correctly', async () => {
  const res = await fetch('http://localhost:5000/api/github/contributions?username=ashutosh607');
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(['live', 'cache'].includes(json.source));
  assert.equal(typeof json.total, 'number');
  assert.ok(json.total > 0, 'Total contributions should be greater than 0');
  assert.ok(Array.isArray(json.contributions), 'Contributions should be an array');
  assert.ok(json.contributions.length >= 365, 'Should have at least 365 days of contributions');

  const firstDay = json.contributions[0];
  assert.match(firstDay.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(typeof firstDay.count, 'number');
  assert.ok(firstDay.level >= 0 && firstDay.level <= 4);

  // Second call must be served from cache
  const res2 = await fetch('http://localhost:5000/api/github/contributions?username=ashutosh607');
  const json2 = await res2.json();
  assert.equal(json2.success, true);
  assert.equal(json2.source, 'cache');
  assert.equal(json2.total, json.total);
});

