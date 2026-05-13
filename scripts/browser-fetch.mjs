// scripts/browser-fetch.mjs
//
// Playwright-backed HTTP fetcher. Looks Response-like (.ok, .status,
// .text(), .arrayBuffer()) so it can plug into createRateLimitedFetcher
// in place of globalThis.fetch.
//
// Lazily launches one Chromium instance and reuses it for every call.
// Cloudflare's managed challenge tracks per-session — once one page in
// the context passes, subsequent navigations to the same origin reuse
// the cf_clearance cookie.

import { chromium } from 'playwright';

let browser = null;
let context = null;

async function ensureBrowser() {
  if (browser) return;
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });
}

export async function browserFetch(url, opts = {}) {
  await ensureBrowser();
  const page = await context.newPage();
  // Default: 5s post-load wait so client-side renders (e.g. Algolia search
  // results) have time to populate the DOM before we grab page.content().
  // Caller can pass { waitForContentMs: 0 } when fetching pre-rendered pages.
  const waitForContentMs = opts.waitForContentMs ?? 5000;
  try {
    // Use domcontentloaded — Cloudflare's challenge keeps the network busy
    // indefinitely, so 'networkidle' never fires. After the initial load we
    // wait up to 25s for the challenge to self-resolve (it redirects once done).
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    // If we landed on a Cloudflare challenge page, wait for it to redirect.
    const initialContent = await page.content();
    if (initialContent.includes('Just a moment') || initialContent.includes('cf-browser-verification')) {
      await page.waitForFunction(
        () => !document.title.includes('Just a moment') && document.body.innerText.length > 5000,
        { timeout: 25_000 }
      );
    }

    // Give client-side JS a moment to populate (Algolia search hits, dynamic
    // pyramid blocks, etc.). Pre-rendered server content is unaffected — this
    // is just an extra grace period.
    if (waitForContentMs > 0) await page.waitForTimeout(waitForContentMs);

    const status = response?.status() ?? 0;
    const text = await page.content();
    return {
      ok: status >= 200 && status < 300,
      status,
      url: page.url(),
      async text() { return text; },
      async arrayBuffer() { return new TextEncoder().encode(text).buffer; },
    };
  } finally {
    await page.close();
  }
}

// Image downloads go through context.request — direct HTTP without rendering.
export async function browserFetchBinary(url) {
  await ensureBrowser();
  const res = await context.request.get(url, { timeout: 30_000 });
  const buf = await res.body();
  return {
    ok: res.ok(),
    status: res.status(),
    async arrayBuffer() { return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); },
  };
}

export async function closeBrowser() {
  if (context) await context.close();
  if (browser) await browser.close();
  context = null;
  browser = null;
}
