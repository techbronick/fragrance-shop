# Redesign Phase 2 — PDP

**Date:** 2026-04-27
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 2 (page-level redesigns) — first sub-page: **Product Detail Page (PDP)**
**Status:** spec — awaiting review

## Single job

> The PDP gives a customer enough confidence to buy a specific size of a specific fragrance.

Everything that serves that job stays. Everything that doesn't is candidate for removal.

## Phase context

This is the first of four Tier-1 page redesigns in Phase 2. The design system from Phase 1 is the substrate — type tokens, color tokens, spacing, motion, primitives are all in place and must not be deviated from. This spec only addresses **layout, hierarchy, content, and component decomposition** for the PDP.

Subsequent Phase 2 sub-projects: Home, Shop, Checkout. Each gets its own spec.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Single job is purchase confidence | Stripping non-essential content from the page |
| 2 | Two-column desktop (~55/45 image/purchase), stacked mobile | Honors customer mental model; minimal mobile disruption |
| 3 | One `<PurchaseBlock>` component, conditionally positioned (inline + mobile sticky bar) | Resolves Phase 1 diagnosis #12 (duplicate purchase cards) |
| 4 | Single image, full-column-width, click → lightbox | Highest impact for least work; no schema changes |
| 5 | Pill-row size selector, single price line below | Reads at a glance; one decisive number |
| 6 | Three sections only: hero (image+purchase), Note olfactive, Detalii | Disciplined hierarchy; specs and occasions merged |
| 7 | Heart/share icons removed; quiet badge pulse for add feedback; `−1+` qty stepper | Reduce decoration, signal action through cart icon |
| 8 | Mobile sticky bar: minimal (`size · price · button`), always visible after scrolled past inline block | Reliable affordance, respects screen real estate |

## Non-goals

- No DB schema changes (single image stays single image; new gallery feature is its own sub-project later)
- No new copy / no editorial rewrites (existing Romanian product descriptions stay as-is)
- No new images / no photo direction
- No multi-language support (parked behind redesign per memory)
- No payment changes (off-site WhatsApp/Telegram model stays)
- No reviews redesign (`Rating` already shipped text-only in Phase 1)
- No PDP analytics or A/B test infrastructure
- No discovery-set PDP (`DiscoverySetProduct.tsx`) — that lives in Phase 3

## Architecture

### File decomposition

The current `src/pages/Product.tsx` is ~700+ lines, mixing layout, image fallback, SKU dedup, RadioGroup picker, two purchase cards, three info sections, and helpers. It will be split.

**Modified:**
- `src/pages/Product.tsx` — restructured. Becomes ~250 lines: routing, data fetching, state (`selectedSku`, `quantity`), renders the new components in the new layout.

**Created:**
- `src/components/product/ProductImage.tsx` — single image + lightbox dialog
- `src/components/product/SizeSelector.tsx` — pill row
- `src/components/product/PurchaseBlock.tsx` — brand caption, name, description (line-clamp-2), size selector, price, shipping estimate, qty stepper, add-to-cart button, optional concentration/family stamps
- `src/components/product/MobileBuyBar.tsx` — fixed bottom-bar wrapper around the same state (size, price, add-to-cart)
- `src/components/product/NotesSection.tsx` — extracted from Product.tsx; renders the simplified Vârf/Inimă/Bază rows that already shipped in Phase 1 Task 9
- `src/components/product/DetailsSection.tsx` — Brand · Concentrație · Familie · An · Gen · Ocazii (chip row) · Rating · Fragrantica footnote

Each new file: one clear responsibility, well-defined props interface, can be reasoned about independently.

### State management

State lives in `Product.tsx` and flows down via props:

```tsx
const [selectedSku, setSelectedSku] = useState<SKU | null>(...);
const [quantity, setQuantity] = useState(1);
const { addItem } = useCart();
```

Both `<PurchaseBlock>` and `<MobileBuyBar>` receive the same props (`product`, `skus`, `selectedSku`, `setSelectedSku`, `quantity`, `setQuantity`, `onAddToCart`). They render the same source of truth — no duplicate state.

### `<PurchaseBlock>` props interface

```tsx
type Props = {
  product: Product;
  skus: SKU[];
  selectedSku: SKU | null;
  onSizeChange: (sku: SKU) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
};
```

`<PurchaseBlock>` renders the full inline content (brand caption, name, description, size pills, price, shipping estimate, qty stepper, add-to-cart, optional concentration/family stamps).

`<MobileBuyBar>` is a **separate self-contained component** receiving the same shared-state props. It does NOT reuse PurchaseBlock's JSX — its layout is too different (one row vs the inline column). The shared source of truth is the parent's state in `Product.tsx`; the markup is each component's own concern.

## Above the fold

### Desktop layout (`md:` and up)

```
┌──────────────────────────────────────────────┬─────────────────────────────┐
│                                              │  DIPTYQUE        ← caption  │
│                                              │  Philosykos      ← h1       │
│                                              │                             │
│                                              │  Description, max 2 lines.  │
│                                              │                             │
│              [bottle image]                  │  [3ml][8ml][30ml][50ml]…   │
│                                              │                             │
│                                              │  1 500 Lei       ← h2       │
│                                              │  🚚 1–3 zile      ← caption │
│                                              │                             │
│                                              │  [−] 1 [+]                  │
│                                              │  [ Adaugă în coș         ]  │
│                                              │  ─                          │
│                                              │  Concentrație · EDP         │
│                                              │  Familie · Lemnos / Verde   │
└──────────────────────────────────────────────┴─────────────────────────────┘
```

- Page max-width 1280, side padding from Phase 1
- 12-col grid: image cols 1–7, purchase cols 8–12
- Purchase column has `position: sticky; top: 96px` (clears the 64px header + 32px breathing space)
- Image: 1:1 aspect ratio, `bg-surface-2` placeholder, `loading="eager"`, click → lightbox

### Mobile layout (`< md`)

Single column, image full-width above purchase block. No sticky on the inline purchase block (the mobile sticky bar handles persistence — see Section: Mobile sticky bar).

### Image lightbox

- shadcn `Dialog` opens on click of the inline image
- `DialogContent` configured: `max-w-[min(100vw,90vh)] aspect-square p-0 bg-paper`
- Single close button (X icon, top-right, `h-10 w-10`, ghost button)
- Tap-outside / Esc closes
- Disabled (`onClick` no-op) when image errored to fallback

### Purchase block contents (rendered top to bottom)

1. **Brand** — caption, `text-text-muted`, `tracking-[0.06em] uppercase` (eyebrow style)
2. **Name** — `text-h1 md:text-h1-md`, Regular weight
3. **Description** — `text-body text-text-muted`, `line-clamp-2`. No "read more" toggle. Full description doesn't reappear elsewhere.
4. **Size pill row** — see "Size selector" below
5. **Price** — `text-h2 md:text-h2-md`, Regular weight, `text-text-strong`. Updates with size selection.
6. **Shipping estimate** — existing `<ShippingEstimate>` component from sub-project D, passed `[selectedSku.stock]`
7. **Qty stepper** — `[−] N [+]`, ghost-icon buttons, `h-8` size, body-sized number. `−` disabled at 1.
8. **Add-to-cart button** — primary, `size="lg"`, full-width. Text varies by stock state:
   - In stock: `Adaugă în coș`
   - Out of stock (`selectedSku.stock === 0`): `Comandă (7–14 zile)`
   - Mid-action (cart-add): same label, but the cart-icon badge in the header pulses (handled by Header in Phase 1; PDP doesn't need to flash anything)
9. **Separator** (`hr` with `border-border`)
10. **Optional stamps** — concentration + family rows, each as `<Eyebrow label="Concentrație">EDP</Eyebrow>`. Hidden if data missing.

### Size selector

```
[3ml]  [8ml]  [30ml]  [50ml]  [100ml]
```

- Horizontal flex row, wraps to a second row at narrow widths
- Each pill: `rounded-pill`, `px-4 py-2`, `text-body`, `border border-border`
- Active: `bg-mocha text-paper border-mocha`
- Inactive: `bg-surface text-text border-border hover:bg-surface-2`
- Out-of-stock: `opacity-60` (still tappable — backorder is a valid action)
- Click → updates `selectedSku` in Product.tsx state
- SKU dedup by `(size_ml, price)` continues from current behavior — only one pill per unique combination
- Sort by `size_ml` ascending

## Below the fold

Single column, max-width 720px, centered with margin auto. 64px (`mb-16`) between sections. Both sections use the same row pattern: caption-eyebrow on the left, body content on the right, 1px `border-b border-border` between rows.

### Note olfactive

```tsx
<NotesSection>
  <Eyebrow>NOTE OLFACTIVE</Eyebrow>
  {notes_top.length && <Row label="Vârf">{notes_top.join(", ")}</Row>}
  {notes_mid.length && <Row label="Inimă">{notes_mid.join(", ")}</Row>}
  {notes_base.length && <Row label="Bază">{notes_base.join(", ")}</Row>}
</NotesSection>
```

- Section omitted entirely if all three arrays are empty
- Phase 1 Task 9 already shipped this content style; Phase 2 just extracts it into its own component file and applies the eyebrow heading

### Detalii

```tsx
<DetailsSection>
  <Eyebrow>DETALII</Eyebrow>
  <Row label="Brand">{product.brand}</Row>
  <Row label="Concentrație">{product.concentration}</Row>
  <Row label="Familie">{product.family}</Row>
  <Row label="An">{product.launch_year}</Row>
  <Row label="Gen">{genderLabel(product)}</Row>
  {/* genderLabel: 'Unisex' if product.gender_neutral === true, otherwise reuse the existing display from Product.tsx (look up the current rendering — it's a string like 'Bărbați' / 'Femei' or similar). Preserve current behavior. */}
  <Row label="Rating"><Rating value={product.rating} count={product.review_count} /></Row>
  {/* Occasions live here as a chip row, optional */}
  {hasOccasions(product) && (
    <Row label="Ocazii">
      {occasions.map(o => <Badge variant="outline" key={o}>{o}</Badge>)}
    </Row>
  )}
  <a
    href={fragranticaUrl(product)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text mt-6"
  >
    Vezi pe Fragrantica <ExternalLink className="h-3 w-3" />
  </a>
</DetailsSection>
```

- The `Rating` component (already shipped Phase 1) lives here as one more row
- Occasions row is a chip-row — uses `Badge` outline variant (Phase 1) for each occasion
- Fragrantica link is a quiet caption with an arrow icon — not a `Card`-wrapped button
- `genderLabel(product)` is a small helper: maps `product.gender_neutral === true` → `'Unisex'`, otherwise → `'Bărbați'` or `'Femei'` based on existing logic in the page (verify in Product.tsx)

### What dies (concrete)

- `DetailedDescription` component / "Experiența Olfactivă" gradient callout / 2-col "Main Features" + "Perfect Moment" boxes
- `BenefitsList` checkmarks ("Transport gratuit la comenzi peste 1350 Lei", etc.)
- `<Heart>` and `<Share2>` icon buttons in the product header
- `<ArrowLeft>` "Înapoi" button at top of page (browser back is sufficient; matches Phase 1 chrome reduction)
- Calendar / Users / Palette / Sparkles icons attached to spec rows

## Mobile sticky bottom bar

`<MobileBuyBar>` — fixed-bottom bar shown on mobile (`md:hidden`) when the inline `<PurchaseBlock>` has scrolled out of view.

```
┌──────────────────────────────────────────────┐
│  30ml · 1 500 Lei         [Adaugă în coș] │
└──────────────────────────────────────────────┘
```

### Detection

`IntersectionObserver` watches the inline `<PurchaseBlock>` root element. When it leaves the viewport (`isIntersecting === false`), the bar fades in (200ms `quick` duration). When the inline block returns, the bar fades out.

### Markup

```tsx
<div
  className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
  <div className="px-4 py-3 flex items-center justify-between gap-3">
    <button
      type="button"
      onClick={scrollToInlineBlock}
      className="text-body text-text-strong text-left flex-1 min-w-0 truncate"
    >
      <span className="text-text-muted">{selectedSku.size_ml}ml</span>
      <span className="mx-2 text-text-faint">·</span>
      <span>{formatPrice(selectedSku.price * quantity)}</span>
    </button>
    <Button variant="primary" size="md" onClick={onAddToCart}>
      {selectedSku.stock > 0 ? "Adaugă în coș" : "Comandă"}
    </Button>
  </div>
</div>
```

### Behavior

- Tap on the size+price text → smooth-scrolls to inline `<PurchaseBlock>` (so the customer can change size or qty)
- Tap on Add → identical behavior to inline button (uses same `onAddToCart` handler)
- Hidden when `selectedSku == null` (e.g. SKUs still loading) and on the error/empty PDP states
- Out-of-stock current size: button label becomes `Comandă` (shorter than mobile-inline `Comandă (7–14 zile)` due to space)
- `safe-area-inset-bottom` ensures clearance over iPhone home indicator
- `border-t border-border` instead of shadow (Phase 1 elevation rules)

## Edge cases & states

| Case | Behavior |
|---|---|
| Loading (productLoading or skusLoading) | Skeleton mirroring the layout: image placeholder (1:1, `bg-surface-2`, `animate-shimmer`), then h1-line skeleton, body-line skeleton, three pill skeletons, price-line, button. No layout shift on load. |
| Product not found (`!product`) | Centered single-column message: `text-h1 "Produs indisponibil"`, body description, ghost button "Înapoi la Magazin" → `/shop`. No icon-in-disc. |
| No SKUs (`skus.length === 0`) | Purchase block hides size selector, qty, add-to-cart. Shows `text-caption "Nu există variante disponibile."` |
| All SKUs `stock === 0` | All pills dimmed, but clickable. Default selected = smallest size. Price + shipping estimate update normally. Button label = `Comandă (7–14 zile)`. Mobile bar shows `Comandă`. |
| Selected SKU goes out of stock mid-session (live refetch) | Pill dims, shipping estimate flips to `7–14 zile`, button label updates. No modal, no toast. |
| Image load failure | `onError` swaps to existing Unsplash placeholder. Lightbox click is disabled (no-op) when `imageError === true`. |
| Lightbox open | Body scroll-lock (shadcn handles). Close: tap-outside, Esc, or close button. |
| Quantity edges | `−` disabled at 1. No upper bound enforced. |
| Reduced motion | All transitions collapse to ≤100ms via the global rule from Phase 1. Lightbox enter, mobile-bar fade, smooth-scroll all degrade. |
| Add-to-cart success | Header cart icon's badge pulses once (Phase 1 behavior, already shipped). PDP itself shows nothing — no flash, no toast. |

## Functionality preservation

The PDP must continue to provide every feature from the Phase 1 audit's list (items 11–20 of the 73 features):

- Product detail page with full specs ✅ (preserved in DetailsSection)
- Fragrance note pyramid ✅ (preserved as NotesSection)
- Product specifications ✅ (preserved in DetailsSection)
- Longevity & projection ❌ (removed in Phase 1 Task 10 — fictional data; spec already approved)
- Wear occasions ✅ (preserved as chip row inside DetailsSection)
- Size variant selection ✅ (now pill row instead of RadioGroup)
- Quantity adjustment ✅ (compact stepper)
- Shipping estimate ✅ (existing component)
- Add-to-cart ✅ (with quiet feedback per Phase 1)
- Fragrantica external link ✅ (preserved as caption-sized footnote)

Heart and Share icons (items 11.h, 11.s of the audit) are intentionally dropped per spec decision #7 / Q7.

## Forward compatibility

- **i18n (sub-project A):** All Romanian strings in the new components (`Vârf`, `Inimă`, `Bază`, `Note olfactive`, `Detalii`, `Brand`, `Concentrație`, `Familie`, `An`, `Gen`, `Rating`, `Ocazii`, `Vezi pe Fragrantica`, `Adaugă în coș`, `Comandă (7–14 zile)`, `Comandă`, `Produs indisponibil`, `Înapoi la Magazin`, `Nu există variante disponibile`) live as inline JSX strings. Sub-project A will extract them. Acceptable for Phase 2 since i18n hasn't started.
- **Product gallery (future):** When schema-level multi-image support arrives, `<ProductImage>` becomes the swap point — replace its single-image markup with a gallery component. The lightbox already supports the pattern.
- **Reviews UI (future):** If reviews ever become more than a numeric rating, the `Rating` row in DetailsSection becomes a link or expandable. Currently text-only is sufficient.
- **Comparison (future):** A "compare" button would live in the purchase block's separator area. Not in scope.

## Out of scope / deferred

- Product image gallery / multiple images (separate sub-project; requires DB schema change)
- Lifestyle photography (separate creative direction work)
- Reviews submission UI
- Personalized recommendations on PDP ("Customers also bought")
- Stock notifications / waitlist for backorder
- Per-country pricing (sub-project B+C only added VAT at checkout, not on PDP — preserved)
- A/B testing infrastructure for the redesigned PDP
- Analytics events on the new components
