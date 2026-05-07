import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

type Entry = { brand: string; name: string };

const priceList: Entry[] = [
  { brand: 'Maison Francis Kurkdjian', name: 'Aqua Celestia' },
  { brand: 'Maison Francis Kurkdjian', name: 'Aqua Media' },
  { brand: 'Maison Francis Kurkdjian', name: 'Gentle Fluidity Gold' },
  { brand: 'Maison Francis Kurkdjian', name: 'À la Rose' },
  { brand: 'Maison Francis Kurkdjian', name: 'Aqua Universalis' },
  { brand: 'Maison Francis Kurkdjian', name: 'Gentle Fluidity Silver' },
  { brand: 'Maison Francis Kurkdjian', name: 'Baccarat Rouge 540 Extrait' },
  { brand: 'Maison Francis Kurkdjian', name: 'Baccarat Rouge 540' },
  { brand: 'Stephane Humbert Lucas', name: 'Sand Dance' },
  { brand: 'Stephane Humbert Lucas', name: 'Mortal Skin' },
  { brand: 'Matiere Premiere', name: 'Neroli Oranger' },
  { brand: 'Matiere Premiere', name: 'Vanilla Power' },
  { brand: "Penhaligon's", name: 'Elizabethan Rose' },
  { brand: "Penhaligon's", name: 'Cairo' },
  { brand: "Penhaligon's", name: 'Babylon' },
  { brand: 'Tom Ford', name: 'Vanille Fatale' },
  { brand: 'Tom Ford', name: 'Vanilla Sex' },
  { brand: 'Tom Ford', name: 'Cherry Smoke' },
  { brand: 'Tom Ford', name: 'Bitter Peach' },
  { brand: 'Tom Ford', name: 'Neroli Portofino' },
  { brand: 'Ex Nihilo', name: 'Blue Talisman' },
  { brand: 'Ex Nihilo', name: 'Blue Talisman Extrait' },
  { brand: 'Ex Nihilo', name: 'The Hedonist Extrait de Parfum' },
  { brand: 'Ex Nihilo', name: 'The Hedonist' },
  { brand: 'Ex Nihilo', name: 'Fleur Narcotique' },
  { brand: 'Ex Nihilo', name: 'Generation(s)' },
  { brand: 'Hormone Paris', name: 'This is not GABA' },
  { brand: 'Parfums de Marly', name: 'Valaya' },
  { brand: 'Parfums de Marly', name: 'Valaya Exclusif' },
  { brand: 'Parfums de Marly', name: 'Delina' },
  { brand: 'Parfums de Marly', name: 'Delina Exclusif' },
  { brand: 'Parfums de Marly', name: 'Oriana' },
  { brand: 'Parfums de Marly', name: 'Delina La Rosee' },
  { brand: 'Kilian', name: "Angels' Share" },
  { brand: 'Le Labo', name: 'Another 13' },
  { brand: 'Le Labo', name: 'Santal 33' },
  { brand: 'Le Labo', name: 'Labdanum 18' },
  { brand: 'Creed', name: 'Aventus Man' },
  { brand: 'Creed', name: 'Aventus for Her' },
  { brand: 'AUM', name: 'Power is Power Extrait de Parfum' },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function main() {
  const { data, error } = await supabase.from('products').select('id, brand, name');
  if (error) {
    console.error('Query failed:', error);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Products in DB: ${rows.length}\n`);

  // Build brand -> normalized names
  const byBrandNorm = new Map<string, { id: string; name: string; brand: string }[]>();
  for (const r of rows) {
    const k = norm(r.brand);
    if (!byBrandNorm.has(k)) byBrandNorm.set(k, []);
    byBrandNorm.get(k)!.push(r);
  }

  const matched: { entry: Entry; product: { id: string; name: string; brand: string } }[] = [];
  const missing: Entry[] = [];

  for (const e of priceList) {
    const bucket = byBrandNorm.get(norm(e.brand)) ?? [];
    const hit = bucket.find((p) => norm(p.name) === norm(e.name));
    if (hit) matched.push({ entry: e, product: hit });
    else missing.push(e);
  }

  console.log(`=== MATCHED (${matched.length}/${priceList.length}) ===`);
  for (const m of matched) {
    console.log(`  ✓ ${m.entry.brand} — ${m.entry.name}  (db: "${m.product.brand}" / "${m.product.name}", id=${m.product.id})`);
  }

  console.log(`\n=== MISSING (${missing.length}/${priceList.length}) ===`);
  for (const m of missing) {
    console.log(`  ✗ ${m.brand} — ${m.name}`);
  }

  // Also list brands present in DB that are relevant
  const priceBrands = new Set(priceList.map((e) => norm(e.brand)));
  const dbBrandsSeen = new Set<string>();
  for (const r of rows) {
    if (priceBrands.has(norm(r.brand))) dbBrandsSeen.add(r.brand);
  }
  console.log(`\n=== DB brands that overlap with price list (raw strings) ===`);
  for (const b of dbBrandsSeen) console.log(`  • ${b}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
