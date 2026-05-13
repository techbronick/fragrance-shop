import { test } from 'node:test';
import assert from 'node:assert/strict';
import { browserFetch, closeBrowser } from './browser-fetch.mjs';

test('browserFetch bypasses Cloudflare on fragrantica.com', { timeout: 60_000 }, async () => {
  const res = await browserFetch('https://www.fragrantica.com/search/?query=tom+ford+black+orchid');
  const html = await res.text();
  // Cloudflare challenge stub is ~5 KB and contains "Just a moment...". Real
  // search results page is ~50 KB+ and contains "perfume" many times.
  assert.ok(html.length > 20_000, `response was only ${html.length} bytes — likely a challenge page`);
  assert.ok(!html.includes('Just a moment...'), 'still seeing Cloudflare challenge page');
  assert.ok(html.toLowerCase().includes('perfume'), 'real search results not detected');
});

test('cleanup', { timeout: 10_000 }, async () => {
  await closeBrowser();
});
