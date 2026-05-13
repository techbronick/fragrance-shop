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

// playwright-extra wraps Playwright so we can register the stealth plugin,
// which patches ~10 navigator.* and JS quirks that Cloudflare's bot
// detection samples (navigator.webdriver, plugins length, permission queries,
// WebGL renderer, etc.). Without it, Cloudflare blocks /perfume/ pages with
// a 403 challenge that never auto-resolves in headless chromium.
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

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
  // Override the per-page default for all waitFor* operations so subsequent
  // calls don't silently use Playwright's 30s default when the challenge or
  // a slow Algolia render needs longer.
  page.setDefaultTimeout(60_000);
  // Default: 5s post-load wait so client-side renders (e.g. Algolia search
  // results) have time to populate the DOM before we grab page.content().
  // Caller can pass { waitForContentMs: 0 } when fetching pre-rendered pages.
  const waitForContentMs = opts.waitForContentMs ?? 2000;
  try {
    // Use domcontentloaded — Cloudflare's challenge keeps the network busy
    // indefinitely, so 'networkidle' never fires. After the initial load we
    // wait up to 25s for the challenge to self-resolve (it redirects once done).
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    // Unconditional grace period after navigation. Cloudflare's JS challenge
    // resolves itself in well under 5s in a real browser; client-side renders
    // (Algolia search hits, pyramid blocks) need a moment too. Polling for
    // title changes was flaky — a flat wait is more reliable.
    if (waitForContentMs > 0) await page.waitForTimeout(waitForContentMs);

    // Defensive check: if the page is STILL on the Cloudflare interstitial
    // after the grace period, give it one more chance.
    const title = await page.title();
    if (title.includes('Just a moment')) {
      await page.waitForFunction(
        () => !document.title.includes('Just a moment'),
        null,
        { timeout: 30_000 }
      ).catch(() => {/* ignore — caller will see the bad response */});
    }

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
