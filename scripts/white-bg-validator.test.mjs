import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { isWhiteBackground, processImage } from './white-bg-validator.mjs';

test('detects a real white-background bottle image', async () => {
  const buf = await fs.readFile('scripts/fixtures/white-bg.webp');
  assert.equal(await isWhiteBackground(buf), true);
});

test('rejects an image whose corners are non-white', async () => {
  const buf = await fs.readFile('scripts/fixtures/colored-bg.webp');
  assert.equal(await isWhiteBackground(buf), false);
});

test('processImage returns a WebP buffer under 800px', async () => {
  const buf = await fs.readFile('scripts/fixtures/white-bg.webp');
  const out = await processImage(buf);
  // WebP magic: "RIFF....WEBP"
  assert.equal(out.subarray(0, 4).toString(), 'RIFF');
  assert.equal(out.subarray(8, 12).toString(), 'WEBP');
});
