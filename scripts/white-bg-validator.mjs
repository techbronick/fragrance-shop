// scripts/white-bg-validator.mjs
//
// Decide whether a product image has a (nearly) white background by sampling
// twelve pixels: four corners, four mid-edges, and four pixels 5% inset from
// the corners. If every sampled pixel has R, G, B all >= 240 we treat it as
// white-bg. Otherwise we reject it — the project policy is "white-bg only".
//
// processImage() resizes to max 800x800 (preserving aspect ratio) and
// re-encodes as quality-82 WebP, returning the buffer for upload.

import sharp from 'sharp';

const NEAR_WHITE = 240;

export async function isWhiteBackground(buffer) {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const { width: w, height: h } = meta;
  if (!w || !h) return false;

  const inset = (n) => Math.max(0, Math.min(n - 1, Math.round(n * 0.05)));
  const ix = inset(w);
  const iy = inset(h);

  // 12 sample points: 4 corners + 4 mid-edges + 4 inset corners.
  const points = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
    [ix, iy], [w - 1 - ix, iy], [ix, h - 1 - iy], [w - 1 - ix, h - 1 - iy],
  ];

  const raw = await sharp(buffer).removeAlpha().raw().toBuffer();
  const channels = 3; // RGB after removeAlpha
  for (const [x, y] of points) {
    const i = (y * w + x) * channels;
    if (raw[i] < NEAR_WHITE || raw[i + 1] < NEAR_WHITE || raw[i + 2] < NEAR_WHITE) {
      return false;
    }
  }
  return true;
}

export async function processImage(buffer) {
  return sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
