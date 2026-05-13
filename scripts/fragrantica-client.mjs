// scripts/fragrantica-client.mjs
//
// Fragrantica search + perfume-page parser.
//
//   parseSearchResults(html)        — extract candidate perfumes from a search page
//   pickBestMatch(c, brand, name)   — Levenshtein-based fuzzy match, threshold default 0.85
//
// parsing functions take pre-loaded HTML strings — fully testable against fixtures.

import * as cheerio from 'cheerio';

const FRAGRANTICA_ORIGIN = 'https://www.fragrantica.com';

/**
 * Parse Fragrantica search results page HTML and return an array of
 * { brand, name, url } objects.
 *
 * The page uses two link structures:
 *
 * 1. Relative-URL cards (e.g. Latest Reviews sidebar):
 *    <a href="/perfume/Brand/Name-ID.html" ...>
 *      ...
 *      <p ...>Brand</p>
 *      <p ...>Name</p>
 *      ...
 *    </a>
 *
 * 2. Absolute-URL inline links (e.g. Top Popular list):
 *    <a href="https://www.fragrantica.com/perfume/Brand-Slug/Name-Slug-ID.html" ...>
 *      Name Brand
 *    </a>
 *    The text contains name + brand concatenated (name first, then brand as suffix).
 *    We derive brand and name from the URL slug to avoid the ambiguity.
 */
export function parseSearchResults(html) {
  const $ = cheerio.load(html);
  const out = [];
  const seen = new Set();

  function addResult(brand, name, absUrl) {
    brand = brand.trim();
    name = name.trim();
    if (!brand || !name) return;
    if (seen.has(absUrl)) return;
    seen.add(absUrl);
    out.push({ brand, name, url: absUrl });
  }

  // Strategy 1: relative-URL cards that contain two <p> tags (brand, then name)
  $('a[href*="/perfume/"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    if (!href.includes('/perfume/')) return;

    // Skip absolute URLs here — handled by Strategy 2
    if (href.startsWith('http')) return;

    const absUrl = FRAGRANTICA_ORIGIN + href;

    // The card structure has two <p> tags: first = brand, second = name
    const ps = a.find('p');
    if (ps.length >= 2) {
      const brand = $(ps[0]).text().trim();
      const name = $(ps[1]).text().trim();
      addResult(brand, name, absUrl);
      return;
    }

    // Fallback: derive from URL slug /perfume/BrandSlug/NameSlug-ID.html
    const slugInfo = extractFromSlug(href);
    if (slugInfo) {
      addResult(slugInfo.brand, slugInfo.name, absUrl);
    }
  });

  // Strategy 2: absolute-URL inline links — derive brand+name from URL slug
  $('a[href^="https://www.fragrantica.com/perfume/"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    const slugInfo = extractFromSlug(href);
    if (slugInfo) {
      addResult(slugInfo.brand, slugInfo.name, href);
    }
  });

  return out;
}

/**
 * Extract brand and name from a Fragrantica perfume URL.
 * URL format: /perfume/Brand-Slug/Name-Slug-ID.html
 *             or https://www.fragrantica.com/perfume/Brand-Slug/Name-Slug-ID.html
 *
 * Returns { brand, name } or null.
 */
function extractFromSlug(href) {
  const m = href.match(/\/perfume\/([^/]+)\/([^/]+)\.html/);
  if (!m) return null;

  const brandSlug = m[1];
  const nameSlug = m[2];

  // Brand: replace hyphens with spaces
  const brand = brandSlug.replace(/-/g, ' ');

  // Name slug ends with a numeric ID: strip it
  const nameParts = nameSlug.split('-');
  // Remove trailing numeric segment(s)
  while (nameParts.length > 1 && /^\d+$/.test(nameParts[nameParts.length - 1])) {
    nameParts.pop();
  }
  const name = nameParts.join(' ');

  if (!brand || !name) return null;
  return { brand, name };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarity(a, b) {
  const aN = a.toLowerCase().trim();
  const bN = b.toLowerCase().trim();
  const longer = Math.max(aN.length, bN.length);
  if (longer === 0) return 1;
  return 1 - levenshtein(aN, bN) / longer;
}

export function pickBestMatch(candidates, brand, name, threshold = 0.85) {
  if (!candidates?.length) return null;
  const query = `${brand} ${name}`;
  let best = null;
  let bestSim = -1;
  for (const c of candidates) {
    const cQuery = `${c.brand} ${c.name}`;
    const s = similarity(query, cQuery);
    if (s > bestSim) {
      bestSim = s;
      best = { ...c, similarity: s };
    }
  }
  return best && bestSim >= threshold ? best : null;
}
