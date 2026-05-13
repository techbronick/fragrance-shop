// scripts/fetch-fragrantica.mjs
//
// One-shot CLI that walks every Supabase product and enriches it from
// Fragrantica. Resumable via products.last_parsed_at. Designed to be safe
// to re-run.
//
// CLI:
//   node scripts/fetch-fragrantica.mjs [--dry-run] [--force] [--limit N]
//                                       [--from-brand "X"] [--skip-images]
//
// Required env vars (.env via dotenv):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY  (only needed when --skip-images is NOT set)

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createRateLimitedFetcher } from './rate-limiter.mjs';
import { browserFetch, browserFetchBinary, closeBrowser } from './browser-fetch.mjs';
import { parseSearchResults, pickBestMatch, parsePerfumePage } from './fragrantica-client.mjs';
import { isWhiteBackground, processImage } from './white-bg-validator.mjs';
import { createUploader } from './storage-upload.mjs';
import fs from 'node:fs/promises';

config();

function parseArgs(argv) {
  const args = { dryRun: false, force: false, limit: null, fromBrand: null, skipImages: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--skip-images') args.skipImages = true;
    else if (a === '--limit') { args.limit = parseInt(argv[++i], 10); }
    else if (a === '--from-brand') { args.fromBrand = argv[++i]; }
    else if (a.startsWith('--')) { console.error(`Unknown flag: ${a}`); process.exit(2); }
  }
  return args;
}

function requireEnv(args) {
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }
  if (!args.skipImages && !args.dryRun) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env — needed for image upload.');
      console.error('Add it temporarily, run the script, then remove. Or pass --skip-images.');
      process.exit(1);
    }
  }
}

const args = parseArgs(process.argv);
requireEnv(args);
console.log('args:', args);

async function loadProductsToProcess(supabase, args) {
  let query = supabase.from('products').select('id, brand, name, image_url').order('brand').order('name');
  if (!args.force) {
    // Resume-aware: skip products parsed in the last 30 days.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.or(`last_parsed_at.is.null,last_parsed_at.lt.${thirtyDaysAgo}`);
  }
  if (args.fromBrand) query = query.eq('brand', args.fromBrand);

  // Paginate — single .select() caps at 1000.
  const all = [];
  let from = 0;
  while (true) {
    const { data, error } = await query.range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return args.limit ? all.slice(0, args.limit) : all;
}

// Use service-role for the DB client — RLS on `products` requires admin
// privileges for UPDATE. With the anon key, UPDATEs return success but the
// data is unchanged (silent RLS reject). The service-role key is also
// required for image upload, so this is consistent.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey);
const products = await loadProductsToProcess(supabase, args);
console.log(`Loaded ${products.length} products to process.`);

// Build a rate-limited browserFetch — pages go through Playwright (Cloudflare-bypass).
// Image fetches use browserFetchBinary directly (no Cloudflare on fimgs.net,
// and the rate-limiter applies the same delay budget either way).
const fetchPage = createRateLimitedFetcher({
  fetchImpl: (url, opts) => browserFetch(url, opts),
});
const fetchImage = createRateLimitedFetcher({
  fetchImpl: (url) => browserFetchBinary(url),
});

const uploader = args.dryRun || args.skipImages ? null : createUploader();

const report = {
  total: products.length,
  fullyEnriched: 0,
  partial: 0,
  noMatch: [],
  imageRejected: [],
  errors: [],
};

function nowIso() { return new Date().toISOString(); }

async function processOne(p, idx) {
  const tStart = Date.now();
  console.log(`[${idx + 1}/${products.length}] ${p.brand} / ${p.name}`);

  // 1) Search Fragrantica.
  const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(p.brand + ' ' + p.name)}`;
  const searchRes = await fetchPage(searchUrl);
  if (!searchRes.ok) throw new Error(`search returned ${searchRes.status}`);
  const searchHtml = await searchRes.text();
  const candidates = parseSearchResults(searchHtml);
  const match = pickBestMatch(candidates, p.brand, p.name);
  if (!match) {
    console.log('  ✗ no match');
    report.noMatch.push({ brand: p.brand, name: p.name });
    return;
  }
  console.log(`  ✓ matched ${match.brand} / ${match.name} (sim=${match.similarity.toFixed(2)})`);

  // 2) Fetch + parse perfume page.
  const pageRes = await fetchPage(match.url);
  if (!pageRes.ok) throw new Error(`perfume page returned ${pageRes.status}`);
  const pageHtml = await pageRes.text();
  const data = parsePerfumePage(pageHtml);
  const totalNotes = data.notesTop.length + data.notesMid.length + data.notesBase.length;
  console.log(`  ✓ parsed: ${totalNotes} notes, ${data.concentration ?? 'unknown'}, ${data.year ?? 'unknown'}`);

  // 3) Image — only if product doesn't already have a Supabase image.
  let newImageUrl = null;
  const hasSupabaseImage = p.image_url?.includes('supabase.co');
  if (!args.skipImages && !hasSupabaseImage && data.imageUrl) {
    const imgRes = await fetchImage(data.imageUrl);
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const isWhite = await isWhiteBackground(buf);
      if (isWhite) {
        const processed = await processImage(buf);
        if (!args.dryRun) {
          newImageUrl = await uploader(p.id, processed);
          console.log('  ✓ image uploaded');
        } else {
          console.log('  ✓ image would be uploaded (dry-run)');
        }
      } else {
        console.log('  ⚠ image rejected — non-white background');
        report.imageRejected.push({ brand: p.brand, name: p.name });
      }
    }
  } else if (hasSupabaseImage) {
    console.log('  · image skip (already have Supabase image)');
  }

  // 4) Write to DB.
  // Only include fields the parser actually populated. NULLs would either
  // wipe out previously-correct data OR fail NOT-NULL constraints on
  // columns like `family` and `concentration` that the schema marks
  // NOT NULL. last_parsed_at is always set.
  const rawUpdates = {
    description: data.description || null,
    notes_top: data.notesTop?.length ? data.notesTop : null,
    notes_mid: data.notesMid?.length ? data.notesMid : null,
    notes_base: data.notesBase?.length ? data.notesBase : null,
    concentration: data.concentration,
    family: data.family,
    launch_year: data.year,
    gender: data.gender,
    rating: data.rating,
    review_count: data.reviewCount,
  };
  const updates = { last_parsed_at: nowIso() };
  for (const [k, v] of Object.entries(rawUpdates)) {
    if (v !== null && v !== undefined) updates[k] = v;
  }
  if (newImageUrl) updates.image_url = newImageUrl;

  if (!args.dryRun) {
    const { error } = await supabase.from('products').update(updates).eq('id', p.id);
    if (error) throw new Error(`DB update failed: ${error.message}`);
    console.log(`  ✓ DB updated (${Date.now() - tStart}ms)`);
  } else {
    console.log(`  ✓ would update DB (dry-run, ${Date.now() - tStart}ms)`);
  }

  const hasImage = !!newImageUrl || hasSupabaseImage || !!p.image_url;
  if (hasImage && totalNotes > 0 && data.description) report.fullyEnriched++;
  else report.partial++;
}

try {
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      await processOne(p, i);
    } catch (err) {
      console.log(`  ✗ error: ${err.message}`);
      report.errors.push({ brand: p.brand, name: p.name, error: err.message });
    }
  }
} finally {
  // Always close Playwright cleanly even if the run aborts.
  await closeBrowser();
}

// Write the final report.
const lines = [];
lines.push('# Fragrantica Enrichment Report');
lines.push(`Generated: ${nowIso()}`);
lines.push('');
lines.push(`Total processed:       ${report.total}`);
lines.push(`Fully enriched:        ${report.fullyEnriched}`);
lines.push(`Partial (some fields): ${report.partial}`);
lines.push(`No Fragrantica match:  ${report.noMatch.length}`);
lines.push(`Image rejected:        ${report.imageRejected.length}`);
lines.push(`Errors:                ${report.errors.length}`);
lines.push('');
if (report.noMatch.length) {
  lines.push('## No match');
  for (const x of report.noMatch) lines.push(`  ${x.brand} / ${x.name}`);
  lines.push('');
}
if (report.imageRejected.length) {
  lines.push('## Image rejected (non-white background)');
  for (const x of report.imageRejected) lines.push(`  ${x.brand} / ${x.name}`);
  lines.push('');
}
if (report.errors.length) {
  lines.push('## Errors');
  for (const x of report.errors) lines.push(`  ${x.brand} / ${x.name}  — ${x.error}`);
  lines.push('');
}
await fs.writeFile('fragrantica-enrichment-report.txt', lines.join('\n'));
console.log('\nWrote fragrantica-enrichment-report.txt');
