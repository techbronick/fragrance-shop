import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseSearchResults, pickBestMatch, parsePerfumePage } from './fragrantica-client.mjs';

test('parseSearchResults extracts at least one result from the fixture', async () => {
  const html = await fs.readFile('scripts/fixtures/search-result.html', 'utf8');
  const results = parseSearchResults(html);
  assert.ok(results.length > 0, 'expected at least 1 result');
  for (const r of results) {
    assert.ok(r.url && r.url.startsWith('http'), `bad url: ${r.url}`);
    assert.ok(r.brand && r.brand.length > 0, 'missing brand');
    assert.ok(r.name && r.name.length > 0, 'missing name');
  }
});

test('parseSearchResults finds Black Orchid in the Tom Ford fixture', async () => {
  const html = await fs.readFile('scripts/fixtures/search-result.html', 'utf8');
  const results = parseSearchResults(html);
  const blackOrchid = results.find((r) => /black orchid/i.test(r.name));
  assert.ok(blackOrchid, 'Black Orchid not found in results');
  assert.match(blackOrchid.brand, /tom\s*ford/i);
});

test('pickBestMatch picks the result with highest similarity to query', () => {
  const candidates = [
    { brand: 'Tom Ford', name: 'Black Orchid', url: 'http://x/a' },
    { brand: 'Tom Ford', name: 'White Suede', url: 'http://x/b' },
    { brand: 'Random Brand', name: 'Some Name', url: 'http://x/c' },
  ];
  const best = pickBestMatch(candidates, 'Tom Ford', 'Black Orchid');
  assert.equal(best?.url, 'http://x/a');
  assert.ok(best.similarity >= 0.95);
});

test('pickBestMatch returns null when no candidate clears the threshold', () => {
  const candidates = [
    { brand: 'X', name: 'Y', url: 'http://x/z' },
  ];
  const best = pickBestMatch(candidates, 'Tom Ford', 'Black Orchid', 0.85);
  assert.equal(best, null);
});

test('parsePerfumePage extracts core fields from the perfume fixture', async () => {
  const html = await fs.readFile('scripts/fixtures/perfume-page.html', 'utf8');
  const data = parsePerfumePage(html);

  assert.ok(data.description && data.description.length > 50, 'description too short');
  assert.ok(Array.isArray(data.notesTop), 'notesTop should be an array');
  assert.ok(Array.isArray(data.notesMid), 'notesMid should be an array');
  assert.ok(Array.isArray(data.notesBase), 'notesBase should be an array');
  assert.ok(data.imageUrl && data.imageUrl.startsWith('http'), 'imageUrl missing');
  // At least one note set must produce results on Tom Ford / Black Orchid.
  const totalNotes = data.notesTop.length + data.notesMid.length + data.notesBase.length;
  assert.ok(totalNotes > 0, 'no notes extracted at all');
});
