# Redesign Phase 3 — Discovery

**Date:** 2026-04-28
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 3 (Tier-2 page redesigns) — first sub-project: **Discovery flow**
**Status:** spec — awaiting review

## Single job

> Help a customer try multiple fragrances before committing to a full bottle.

Three paths to that goal: predefined sets (curation), custom builder (self-service), AI recommendation (guided). All three preserved as URL-distinct surfaces.

## Phase context

Phase 2 (PDP / Home / Shop / Checkout) shipped on 2026-04-27/28. This is the first Phase 3 sub-project. After Discovery: Order pages, Auth, static pages.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Single job: try-before-bottle confidence | Justifies preserving all three paths |
| 2 | URL-based view dispatch (`/discovery-sets`, `/discovery-sets/builder`, `/discovery-sets/recommend`) — Q2 B | Matches Phase 2 Shop view-toggle precedent; shareable per-path links |
| 3 | Two-pane builder (catalog left, tray right sticky) — Q3 A | Spatially obvious "pick from catalog into basket" pattern |
| 4 | Set detail (`/discovery-set/:id`) reuses Phase 2 PDP layout — Q4 A | Coherent shape; reuses ProductImage, MobileBuyBar; new SetPurchaseBlock for set-shaped data |
| 5 | AI recommendation: redesigned 3-step wizard, one question per screen — Q5 ii + Q6 A | Brand-voice match; Apple-keynote pacing |
| 6 | Predefined sets grid: 3-col desktop, 2-col mobile — Q5 a | Same density as Shop; consistent rhythm |

## Non-goals

- No DB schema changes
- No new copy / no editorial rewrites
- No new photography
- No multi-language support (parked behind redesign)
- No saved-drafts / continue-building feature
- No set-comparison feature
- No "surprise me" auto-fill in builder
- No social sharing of custom sets
- No payment integration changes (off-site model preserved)

## Architecture

### File map

**Modified (2 files):**
- `src/pages/DiscoverySets.tsx` — orchestration + URL view dispatch; targets ~150 lines
- `src/pages/DiscoverySetProduct.tsx` — restructured to reuse Phase 2 PDP layout; targets ~150 lines

**Created (7 new component files):**
- `src/components/discovery/PredefinedSetsGrid.tsx` — default landing view for `/discovery-sets`
- `src/components/discovery/SetBuilder.tsx` — two-pane container; orchestrates SetCatalogPane + SetTray
- `src/components/discovery/SetCatalogPane.tsx` — left + middle pane: filter sidebar + product catalog; reuses Shop's `<FilterSidebar>`
- `src/components/discovery/SetTray.tsx` — right pane: slot list + total + add-to-cart
- `src/components/discovery/RecommendationWizard.tsx` — 3-step questionnaire with results page
- `src/components/discovery/SetPurchaseBlock.tsx` — adapted PurchaseBlock for set-shaped data (used by DiscoverySetProduct)
- `src/components/discovery/SetMobileBuyBar.tsx` — adapted MobileBuyBar for set-shaped data

**Replaced (existing files dropped or rewritten):**
- `DiscoverySetBuilder.tsx` → replaced by `SetBuilder` + `SetCatalogPane` + `SetTray`
- `DiscoveryRecommendation.tsx` → replaced by `RecommendationWizard`
- `DiscoveryConfigSelector.tsx`, `DiscoveryProductSelector.tsx`, `DiscoverySlotsManager.tsx`, `DiscoverySetActions.tsx`, `DiscoverySetNameEditor.tsx`, `ProductFilters.tsx`, `ProductGrid.tsx` — dropped; their roles fold into `SetCatalogPane` and `SetTray`. After this redesign nothing imports them; safe to delete.

**Reused:**
- Phase 2 `<FilterSidebar>` (consumed inside SetCatalogPane)
- Phase 2 `<ProductImage>`, `<MobileBuyBar>` (consumed by DiscoverySetProduct)
- Phase 1 primitives + `<DiscoveryProductCard>` (kept; cleanup pass for tokens if needed)
- Existing hooks: `useDiscoverySetConfigs`, `useDiscoverySetConfigsWithItems`, `useProducts`

## Hub `/discovery-sets`

### View toggle (top of page)

```tsx
<nav className="flex flex-wrap gap-6 mb-8">
  <Link to="/discovery-sets" className={...}>Predefinite</Link>
  <Link to="/discovery-sets/builder" className={...}>Construiește</Link>
  <Link to="/discovery-sets/recommend" className={...}>Ajută-mă să aleg</Link>
</nav>
```

Active link: `text-text-strong font-medium`. Inactive: `text-text-muted hover:text-text duration-instant ease-default`. Same pattern as Shop's `Produse · Branduri`.

### Page header (always visible above the view body)

```tsx
<h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
  Seturi Discovery
</h1>
<p className="text-body text-text-muted mt-2 max-w-2xl">
  Mostre întâi. Decide care merită sticla — fără riscuri.
</p>
```

### Predefined view — `<PredefinedSetsGrid>`

3-col grid desktop / 2-col mobile. Card layout:
- Image: `aspect-square bg-surface-2`
- Name: `text-body text-text-strong`
- Sub-line: `text-caption text-text-muted` — `{total_slots} mostre · {volume_ml}ml`
- Price: `text-body text-text`
- Click target: entire card → `/discovery-set/:id`

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
  {sets.map(set => (
    <Link
      key={set.id}
      to={`/discovery-set/${set.id}`}
      className="block bg-surface border border-border rounded-md overflow-hidden"
    >
      <div className="aspect-square bg-surface-2">
        {set.image_url && (
          <img src={set.image_url} alt={set.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4 space-y-1">
        <p className="text-body text-text-strong">{set.name}</p>
        <p className="text-caption text-text-muted">
          {set.total_slots} {set.total_slots === 1 ? 'mostră' : 'mostre'} · {set.volume_ml}ml
        </p>
        <p className="text-body text-text">{formatPrice(set.base_price)}</p>
      </div>
    </Link>
  ))}
</div>
```

Empty state: `text-h3 "Nu există seturi predefinite momentan."` centered.
Loading: 6 skeleton cards using `animate-shimmer`.

## Set detail `/discovery-set/:id`

Reuses Phase 2 PDP shape.

### Above the fold (12-col grid)

- Image cols 1–7: `<ProductImage>` (Phase 2 component, renders the set's `image_url` 1:1, click → lightbox)
- Purchase block cols 8–12: new `<SetPurchaseBlock>`, sticky `lg:sticky lg:top-24`

### `<SetPurchaseBlock>` props + content

```tsx
type Props = {
  config: DiscoverySetConfigWithItems;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  isAdding: boolean;
};
```

Markup shape:
- Eyebrow `SET DISCOVERY` (caption, uppercase, tracked)
- `text-h1 md:text-h1-md font-normal text-text-strong` — set name
- `text-body text-text-muted line-clamp-2` — description
- `text-body text-text-muted` — `{total_slots} mostre × {volume_ml}ml`
- `text-h2 md:text-h2-md font-normal text-text-strong` — total price (`base_price × quantity`)
- `<ShippingEstimate>` — based on availability of underlying SKUs (use first item's stock as the proxy, or pass `[]` for sets if SKU stocks aren't loaded)
- Quantity stepper `[−] N [+]`
- Primary `Adaugă în coș` button, full-width

### Below the fold — `Fragranțele din set`

```tsx
<section className="max-w-[1280px] mx-auto px-... mb-16 md:mb-24">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
    Fragranțele din set
  </p>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {config.items?.map(item => (
      <DiscoveryProductCard key={item.slot_index} item={item} />
    ))}
  </div>
</section>
```

`<DiscoveryProductCard>` already exists; the redesign verifies it has no decoration left from Phase 1 and adapts it to the new tokens. Each card links to the underlying product's PDP.

### `<SetMobileBuyBar>`

Mirror of Phase 2 `<MobileBuyBar>`, set-shaped:

```tsx
type Props = {
  config: DiscoverySetConfig;
  quantity: number;
  onAddToCart: () => void;
  watchRef: RefObject<HTMLElement>;
};
```

Single row: `{volume_ml}ml × {total_slots} · {price}` left, `Adaugă în coș` button right. Visibility logic (IntersectionObserver on inline purchase block) identical to PDP's MobileBuyBar.

### Edge cases

| Case | Behavior |
|---|---|
| `!config` | Centered "Setul nu este disponibil" + `Înapoi la Seturi` ghost button → `/discovery-sets` |
| `config.items.length === 0` | `Fragranțele din set` section hidden entirely |
| Image fails to load | Existing fallback URL (preserved) |

## Builder `/discovery-sets/builder`

### State (lives in `<SetBuilder>`)

```ts
const [totalSlots, setTotalSlots] = useState<5 | 10>(5);
const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
// optional: `?prefill=A,B,C` → seed selectedProductIds on mount
```

URL param `?size=5` / `?size=10` syncs `totalSlots`. URL param `?prefill=A,B,C` (used by recommendation wizard's "Construiește un set din acestea →") prefills the tray.

### Layout — desktop two-pane

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mărime: [ 5 mostre ]  [ 10 mostre ]                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ ┌────────────────────┐  │
│ │ <SetCatalogPane>                        │ │ <SetTray>           │  │
│ │  - FilterSidebar (slim, lg only)        │ │  3 / 5 mostre       │  │
│ │  - Toolbar (search + sort)              │ │  ▢ Item 1 ✕         │  │
│ │  - Product grid (4-col on desktop)      │ │  ▢ Item 2 ✕         │  │
│ │  - Each card has + Adaugă tap target    │ │  ▢ Item 3 ✕         │  │
│ │  - Already-added cards: ✓ Adăugat       │ │  ─────              │  │
│ │  - Load more button                     │ │  Subtotal           │  │
│ └────────────────────────────────────────┘ │  [ Continuă ]       │  │
│                                              └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### `<SetCatalogPane>` shape

- Internal layout: filter sidebar (left, lg only) + grid (rest)
- Filter sidebar: reuses Phase 2 Shop's `<FilterSidebar>` with `inStock` filter omitted (since builder samples are abstracted from full-bottle stock)
- Toolbar: search input + sort select (5 sort options — same as Shop minus `În stoc primele`)
- Grid: 3-col desktop / 2-col mobile (slimmer than Shop's 4-col because the right pane consumes ~320px on desktop)
- Product cards: keyed off `Product`. Each card has a small mocha-soft circle button in the corner: `+` if not selected, `✓` if selected. Clicking toggles selection. Card body click also toggles.
- Selected cards get `bg-mocha-soft` overlay tint to distinguish

### `<SetTray>` shape

```tsx
<aside className="bg-surface border border-border rounded-md p-6 lg:sticky lg:top-24 lg:self-start">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-1">
    Setul tău
  </p>
  <p className="text-body text-text-strong mb-4">
    {selected.length} / {totalSlots} mostre
  </p>

  {/* Slot progress dots — visual feedback */}
  <div className="flex gap-1 mb-6">
    {Array.from({ length: totalSlots }).map((_, i) => (
      <div
        key={i}
        className={
          "h-1 flex-1 rounded-pill " +
          (i < selected.length ? "bg-mocha" : "bg-surface-2")
        }
      />
    ))}
  </div>

  {/* Selected items */}
  <div className="space-y-3 mb-6">
    {selected.map(item => (
      <div key={item.id} className="flex items-center gap-3">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-10 h-10 object-cover rounded-sm bg-surface-2 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-body text-text-strong truncate">{item.name}</p>
          <p className="text-caption text-text-muted truncate">{item.brand}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Elimină">
          <X />
        </Button>
      </div>
    ))}

    {/* Empty slot placeholders */}
    {Array.from({ length: Math.max(0, totalSlots - selected.length) }).map((_, i) => (
      <div key={`empty-${i}`} className="flex items-center gap-3 opacity-50">
        <div className="w-10 h-10 rounded-sm bg-surface-2 shrink-0" />
        <p className="text-body text-text-muted">Slot gol</p>
      </div>
    ))}
  </div>

  <div className="border-t border-border pt-4 mb-4">
    <div className="flex justify-between text-body">
      <span className="text-text-muted">Subtotal</span>
      <span className="text-text-strong">{formatPrice(subtotal)}</span>
    </div>
  </div>

  <Button
    variant="primary"
    size="lg"
    className="w-full"
    disabled={selected.length === 0}
    onClick={addSetToCart}
  >
    {selected.length === totalSlots
      ? 'Adaugă în coș'
      : `Continuă (${selected.length}/${totalSlots})`}
  </Button>
</aside>
```

### Set size selector (above the two panes)

```
Mărime: [ 5 mostre ]  [ 10 mostre ]
```

Pill row, mocha when active. Switching size:
- 5 → 10: tray expands; remaining slots fill with empty placeholders
- 10 → 5 with 7 selected: truncate to first 5; toast `2 mostre eliminate`

### Add-to-cart logic

When `Adaugă în coș` is clicked with a full tray:

1. Look up the `DiscoverySetConfig` matching `totalSlots` (5 or 10) — use `useDiscoverySetConfigs()` and find `cfg.total_slots === totalSlots && cfg.is_customizable === true`. This config provides the `base_price` (the bundle's fixed price regardless of which fragrances are picked) and `id` (used as `configId`).
2. Construct the cart item:
   ```ts
   addItem({
     id: `custom-${Date.now()}`,
     type: 'custom-bundle',
     configId: customizableConfig.id,
     name: `Set discovery (${totalSlots} mostre)`,
     quantity: 1,
     price: customizableConfig.base_price, // in Lei (per CartItem convention; cart converts to bani at order time)
     selectedItems: selected.map((p, i) => ({ slot_index: i, sku_id: p.id })),
   });
   ```
   Note: `sku_id` here may be a product_id rather than a SKU id. The existing `useCreateOrder` flow has fallback logic handling this case (looks up SKUs by product_id when SKU lookup fails). Preserve current behavior.
3. Show success toast and redirect to `/checkout`.

Logic preserved from existing `DiscoverySetBuilder` — repackaged into the new component shape. The implementation engineer should read the existing builder's add-to-cart for the exact `addItem` payload shape if it differs from the above.

### Mobile layout (builder)

The two-pane doesn't fit. Pattern:
- Catalog full-width
- Filter button in toolbar opens Sheet (same as Shop's mobile filter)
- Tray hidden by default; fixed-bottom bar shows `{selected.length}/{totalSlots} · {subtotal} Lei` + `Vezi setul →` button
- Tap bar → opens tray Sheet from right with full contents + `Adaugă în coș` button

```tsx
<div
  className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
  <button
    type="button"
    onClick={() => setTrayOpen(true)}
    className="w-full px-4 py-3 flex items-center justify-between gap-3"
  >
    <span className="text-body text-text-strong">
      {selected.length} / {totalSlots} · {formatPrice(subtotal)}
    </span>
    <span className="text-body text-text-muted">Vezi setul →</span>
  </button>
</div>
```

The tray Sheet on mobile contains the full `<SetTray>` markup.

## AI recommendation `/discovery-sets/recommend`

Three-step wizard. URL state tracks step + answers.

### State

URL params:
- `?step=1` / `?step=2` / `?step=3` / `?step=results`
- `?occasion=day|evening|special|any`
- `?notes=woody,musk` (comma-separated, multi-select 1-3)
- `?fav=AventusByCreed` (optional free text)

### Step 1 — Pentru ce ocazie?

```tsx
<section className="max-w-[720px] mx-auto px-... py-16 md:py-24">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
    Pasul 1 / 3
  </p>
  <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-12">
    Pentru ce ocazie?
  </h2>
  <div className="flex flex-wrap gap-3">
    {OCCASIONS.map(o => (
      <button
        key={o.value}
        type="button"
        onClick={() => setOccasion(o.value)}
        className={chipClasses(occasion === o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
  <div className="mt-12 flex justify-end">
    <Button variant="primary" size="lg" disabled={!occasion} onClick={next}>
      Continuă →
    </Button>
  </div>
</section>
```

`OCCASIONS = [{ value: 'day', label: 'Zi' }, { value: 'evening', label: 'Seară' }, { value: 'special', label: 'Special' }, { value: 'any', label: 'Toate' }]`

### Step 2 — Ce note te atrag?

Same structure. Multi-select pill chips (max 3). `Continuă →` enables when at least 1 is selected. After 3 selected, 4th click shows quiet caption `Maxim 3 selecții`.

`NOTE_FAMILIES = [{ value: 'woody', label: 'Lemn' }, { value: 'citrus', label: 'Citric' }, { value: 'floral', label: 'Floral' }, { value: 'oriental', label: 'Oriental' }, { value: 'gourmand', label: 'Gurmand' }, { value: 'aquatic', label: 'Aquatic' }, { value: 'green', label: 'Verde' }, { value: 'musk', label: 'Mosc' }]`

### Step 3 — Optional free text

```tsx
<section className="max-w-[720px] mx-auto px-... py-16 md:py-24">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
    Pasul 3 / 3
  </p>
  <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-2">
    Un parfum care îți place?
  </h2>
  <p className="text-body text-text-muted mb-12">
    Opțional. Poți sări peste.
  </p>
  <Input
    value={fav}
    onChange={(e) => setFav(e.target.value)}
    placeholder="Ex. Aventus de Creed, Santal 33..."
    className="max-w-md"
    maxLength={100}
  />
  <div className="mt-12 flex flex-col sm:flex-row sm:justify-between gap-3">
    <Button variant="ghost" size="lg" onClick={back}>
      Înapoi
    </Button>
    <div className="flex gap-3">
      <Button variant="ghost" size="lg" onClick={skipToResults}>
        Sari peste
      </Button>
      <Button variant="primary" size="lg" onClick={goToResults}>
        Vezi recomandările →
      </Button>
    </div>
  </div>
</section>
```

### Results page

```tsx
<section className="max-w-[1280px] mx-auto px-... py-16 md:py-24">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
    Rezultate
  </p>
  <h2 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
    {results.length} sugestii pentru tine
  </h2>
  <p className="text-body text-text-muted mb-8">
    Pe baza alegerilor tale: {summarizeAnswers(answers)}
  </p>

  {results.length === 0 ? (
    <div className="text-center py-16">
      <p className="text-h3 font-medium text-text-strong mb-4">
        Niciun parfum nu se potrivește perfect.
      </p>
      <Button variant="ghost" onClick={restart}>
        Schimbă răspunsurile
      </Button>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        {results.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`/discovery-sets/builder?prefill=${results.map(r => r.id).join(',')}`)}
        >
          Construiește un set din acestea →
        </Button>
        <Button variant="ghost" size="lg" onClick={restart}>
          Înapoi la întrebări
        </Button>
      </div>
    </>
  )}
</section>
```

### Recommendation logic

Preserves whatever logic the existing `DiscoveryRecommendation` component uses. The wizard is a UX redesign — the matching algorithm is the same. The component reads the URL answers and queries the same backend hook.

If the existing component contained the matching logic inline, extract it into a `useDiscoveryRecommendations(answers)` hook. If a hook already exists, reuse it.

## Mobile behavior summary

| Surface | Mobile pattern |
|---|---|
| Hub (predefined) | View toggle wraps; predefined grid 2-col; cards full-width |
| Builder | Catalog full-width; filters in Sheet via toolbar `Filtre`; tray hidden, fixed-bottom bar opens tray Sheet on tap |
| Set detail | Stacked: image, SetPurchaseBlock, composition grid; sticky `<SetMobileBuyBar>` |
| Recommendation wizard | One question per screen; pill chips wrap; step buttons fixed at bottom |

## Edge cases

| Case | Behavior |
|---|---|
| 0 predefined sets | Centered `text-h3 "Nu există seturi predefinite momentan."` |
| Builder loaded with `?prefill=A,B,C` | Tray prefills with those product IDs (looked up via `useProducts`); user can refine before commit |
| Builder size 10 → 5 with 7 in tray | Truncate to first 5; toast `2 mostre eliminate` |
| Set detail config not found | "Setul nu este disponibil" + `Înapoi la Seturi` ghost button |
| Set detail no items | Composition section hidden |
| Recommendation 0 matches | Empty state with `Schimbă răspunsurile` ghost button |
| User clicks fragrance card in set composition | Navigate to PDP `/product/:id` |
| Reduced motion | Wizard step transitions and tray sheet animations collapse to ≤100ms |

## Functionality preservation

Audit items 21–27:

| # | Feature | Preserved? |
|---|---|---|
| 21 | Browse all sets in grid | ✅ |
| 22 | View predefined-set composition | ✅ |
| 23 | Purchase predefined set | ✅ |
| 24 | Customize a discovery set | ✅ |
| 25 | Use Discovery Set Builder | ✅ |
| 26 | Use AI Recommendation engine | ✅ |
| 27 | Add customized set to cart | ✅ |

No regressions; everything preserved.

## Forward compatibility

- **i18n (sub-project A):** all Romanian strings inline. The wizard's `OCCASIONS` and `NOTE_FAMILIES` arrays become the swap points for translatable labels.
- **Set image gallery (future):** `<ProductImage>` lightbox already supports it.
- **Saved builder drafts (future):** state could persist to localStorage by `(totalSlots, selectedItems)` key.
- **More wizard questions (future):** URL-state pattern scales naturally.

## Out of scope / deferred

- Set comparison view
- "Surprise me" auto-fill builder
- Saved drafts / continue-building
- Social sharing
- Per-set product photography
- Custom set naming UI
