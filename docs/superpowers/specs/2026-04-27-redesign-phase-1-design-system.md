# Redesign — Phase 1: Diagnosis + Design System + Primitives

**Date:** 2026-04-27
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 1 of 4 (foundation; subsequent phases handle pages)
**Status:** spec — awaiting review

## Brand spine

> **Eleganta nu se striga.**

Every design decision in this document, and every decision downstream of it, must answer that line. If something on screen is *shouting* — whether through a gradient, an icon-disc, a hover-scale, an exclamation, a gold stripe — it doesn't belong here.

## Customer

25–40, local Moldova + diaspora. Mix of first-time and experienced fragrance buyers. Acquired through Instagram, social posts, and SEO. Mobile-first traffic. Educational without being condescending. The site has to look right in a screenshot — that's how it spreads.

## Brand non-negotiables (locked)

- **Name:** modestshop
- **Logo:** existing mark stays
- **Tagline:** "Eleganta nu se striga"
- **Photography:** post-edited product shots are the visual anchor; design respects them
- **Primary color:** existing mocha (`hsl(24 25% 25%)`) stays as the brand anchor; an expanded warm-neutral ramp is added around it

## Open to redesign

- **Typography:** Playfair Display + Inter is replaced
- **Visual system:** gradients, decorative motion, icon-discs, layout density — all open
- **Page-level IA:** functionality preserved (see preservation map); but section order, hierarchy, and density per page may change in Phase 2

## Goals (this phase)

1. Define the type, color, spacing, motion, and primitives the rest of the redesign inherits from
2. Document every decoration pattern that gets removed and why
3. Catalog the 73 user-facing features that must be preserved across all phases
4. Set the stage for Phase 2 (page-by-page redesigns) without doing the page work yet

## Non-goals (this phase)

- No page-level layout changes beyond what Header/Footer require
- No DB schema changes
- No new features
- No copy rewrites (UI strings stay Romanian as-is until i18n sub-project A resumes)
- No dark mode
- No accessibility audit beyond the floor changes baked into primitives (visible focus rings, semantic markup, reduced-motion compliance)

---

## Diagnosis — 15 things not earning their place

These are the specific failures of the current visual layer. The design system exists to make these impossible to repeat.

1. **Gradients as seasoning.** Seven distinct gradient patterns (hero, notes pyramid yellow→orange / pink→purple / amber→brown, customizable-set badge purple→pink, progress bars green→emerald, hover overlays). None carry information.
2. **Icon-in-disc as compulsion.** `bg-primary/10 rounded-full w-12 h-12 [Icon]` repeats across About, Contact, FAQ, Trust Signals, Discovery benefits.
3. **Notes pyramid is a Christmas tree.** Three gradient cards with left-border accents. Information could be carried by quiet rows of type with small swatches.
4. **Hierarchy compresses on the homepage.** Seven full-width sections at near-equal weight.
5. **Trust-signals row.** "100% Authenticity / Free Shipping / Expert Selection / Sample-to-Bottle" reads as Shopify-default insecurity.
6. **6-column product grid on desktop** — bottle silhouettes collapse to thumbnails. 4 max.
7. **Hardcoded longevity/projection progress bars (75% / 65%)** — fiction, not data. Cut.
8. **`select-none` everywhere on mobile** — disables text selection sitewide. Customer can't copy a name or price. Hostile.
9. **Tagline is nowhere on the site.** The brand spine is missing from the brand surface.
10. **Cart dropdown does too much** — items + qty + remove + totals + CTA in 320px. Becomes a sheet.
11. **Hover-scale tic.** `1.02` on cards, `1.10` on images, pulse on buttons. None explain relationships.
12. **Two purchase cards on the PDP** — mobile inline + desktop sticky, separately maintained.
13. **Discovery set cards crammed.** Image + name + description + config badge + fragrance list + price + two buttons in one tile.
14. **Footer is a graveyard.** 4-column grid with 14 links and a brand description.
15. **Two type families fighting.** Playfair Display + Inter reads "Squarespace template."

---

## Functionality preservation map

Every Phase 1 + Phase 2+ change preserves the **73 user-facing features** identified in the audit. They're grouped by destination so the implementation has a clear contract.

### Product & shopping (1–20) → Shop, PDP

Browse all products (grid/list view); filter by brand / family / gender; search; sort (Featured / Price / Name / Newest); paginate; browse brands A–Z; A–Z jump nav; brand search with ⌘K shortcut; PDP with full specs + notes + ratings; size variants; quantity controls; stock status display; live shipping estimate; add-to-cart with feedback; Fragrantica external link.

### Discovery sets (21–27) → DiscoverySets, DiscoverySetProduct, DiscoverySetBuilder

Browse predefined and customizable sets; predefined-set composition view; purchase predefined; customize via builder; AI recommendation flow; add custom set to cart with sample count + total.

### Shopping cart (28–34) → CartSheet (replaces dropdown)

View mini-cart count; view items; adjust qty; remove items; clear cart; proceed to checkout; subtotal display.

### Checkout & orders (35–45) → Checkout, OrderConfirmation, Orders

Address form (firstName, lastName, email, phone, address, city, postalCode); country select with EU VAT; shipping method select; newsletter opt-in; save address (localStorage); validation; live order summary; VAT calculation per country (MD 15% reverse-calc, EU added on top, others 0%); confirmation page; order history; order detail.

### Account & authentication (46–48) → Login, Admin

Admin email/password login; ProtectedRoute for /admin; admin order management.

### Search & navigation (49–53) → Header, Footer, breadcrumbs

Header search with live results; primary nav (Acasă, Magazin, Seturi Discovery, Despre, Jurnal); footer link grid (now collapsed); breadcrumbs (Discovery flow); ScrollToTop on route change.

### Information pages (54–60) → About, Contact, FAQ, Privacy, Terms, Careers, Blog placeholder

All static content preserved; FAQ accordion smooth-scroll; Contact form; About story.

### UI/UX behaviors (61–73) → System-level

Responsive design across all breakpoints; floating cart-count badge; toast notifications; loading states; keyboard shortcuts; URL state persistence (filters, search, tabs); localStorage persistence; smooth scroll; cart-add feedback; auto-scroll where preserved (none — see "what dies"); marquee (eliminated — see "what dies").

### What dies (motion-related preservation exceptions)

- The brand-logo marquee is **removed**, replaced by a static brand wall. (Item 73)
- Auto-advancing carousels for ClientReviews are **removed** in favor of manual swipe. (Item 72)
- All `hover:scale-*` and `animate-pulse`-on-non-loading-elements are **removed**. The behaviors they suggested ("this is interactive", "this succeeded") are signaled by motion that earns its place — see Motion section.

These three are intentional regressions in motion vocabulary. The features themselves (browsing brands, reading reviews, hover affordance, success feedback) are fully preserved.

---

## Type system — Inter, single voice

One typeface, used with discipline. Three weights, seven sizes.

### Sizes

| Token | Desktop | Mobile | Weight | Used for |
|---|---|---|---|---|
| `display` | 56px | 36px | Light 300 | Hero. **Once** per page. |
| `h1` | 36px | 28px | Regular 400 | Page title (PDP product name, About hero, etc.) |
| `h2` | 24px | 22px | Medium 500 | Section headings |
| `h3` | 20px | 18px | Medium 500 | Subsections, card titles |
| `body-lg` | 18px | 18px | Regular 400 | Reading-heavy passages |
| `body` | 16px | 16px | Regular 400 | Default UI text |
| `caption` | 13px | 13px | Regular 400 | Meta, labels, footnotes |

### Discipline rules

- **No size between these.** `text-2xl`, `text-3xl`, `text-5xl` etc. are forbidden inline.
- **Line-height:** `display = 1.1`, `h1 = 1.2`, `h2/h3 = 1.3`, `body = 1.5`. Tight at top, loose at bottom.
- **Letter-spacing:** `display` and `h1`: `-0.02em`. `body`: `0`. `caption-as-eyebrow`: `+0.06em uppercase`.
- **Uppercase is forbidden** except `caption` used as an eyebrow label.
- **Body weight:** Regular 400 globally. The current `font-light` on `<body>` is removed — it's illegible at small sizes.
- **Light 300 is reserved for `display` only.** At 56px Inter Light reads as confident; at body sizes it's fragile.
- **Playfair Display is removed** entirely from the codebase. The `font-playfair` class disappears.

---

## Color system — warm neutral ramp + mocha

The site lives in shades of warm cream and warm brown. No separate accent color. Mocha IS the accent.

### Warm-neutral ramp (8 stops)

All values HSL.

| Token | HSL | Use |
|---|---|---|
| `--paper` | `30 20% 99%` | Page background |
| `--surface` | `0 0% 100%` | Cards, sheets, the cart panel |
| `--surface-2` | `30 15% 96%` | Hover backgrounds, faint section accents |
| `--border` | `25 10% 88%` | Dividers, input borders, card edges |
| `--text-faint` | `25 8% 60%` | Disabled, low-priority labels |
| `--text-muted` | `25 8% 45%` | Captions, meta text, secondary copy |
| `--text` | `24 12% 22%` | Default body text |
| `--text-strong` | `24 15% 12%` | Headings, strong emphasis |

### Anchor — mocha

| Token | HSL | Use |
|---|---|---|
| `--mocha` | `24 25% 25%` | Primary buttons, focus rings, the wordmark, brand presence |
| `--mocha-hover` | `24 25% 18%` | Pressed/hover state |
| `--mocha-soft` | `24 22% 92%` | Tinted background for the rare deliberate moment |

### Functional colors (used by exception)

| Token | HSL | Use |
|---|---|---|
| `--success` | `90 15% 35%` | Sage. Order-paid confirmation, "added to cart" badge pulse. Not Christmas green. |
| `--error` | `5 50% 38%` | Muted brick. Form errors, destructive confirms. Not alarm red. |

No `--warning`, no `--info`. Both flatten into regular text with `--text-strong`.

### What dies (color)

- All seven gradient patterns from the audit
- Every `bg-primary/10` icon disc — replaced by `--mocha-soft` only at deliberate moments
- Yellow rating stars — replaced by mocha or eliminated
- Gradient progress bars (longevity/projection) — eliminated, see diagnosis #7
- Discovery-set gradient badges — replaced with outlined caption labels

---

## Spacing + grid + radii

### Spacing scale — 4pt grid, 9 tokens

| Token | px | Use |
|---|---|---|
| `1` | 4 | Tight pairs (icon + adjacent text) |
| `2` | 8 | Adjacent items in a stack |
| `3` | 12 | Small gaps |
| `4` | 16 | Default — padding inside cards/buttons |
| `6` | 24 | Section padding (mobile), gap between unrelated items |
| `8` | 32 | Between content blocks |
| `12` | 48 | Section break (mobile) |
| `16` | 64 | Section break (desktop) |
| `24` | 96 | Hero & major page divisions |

**Discipline:** these are the only values. No `p-5`, no `mb-7`, no `gap-3.5`.

### Page width + outer padding

| Breakpoint | Page max-width | Side padding |
|---|---|---|
| `< sm` | full | 16px |
| `sm` (640+) | full | 24px |
| `md` (768+) | full | 32px |
| `lg` (1024+) | 1024 | 48px |
| `xl` (1280+) | **1280** | 64px |
| `2xl` (1536+) | 1280 | 64px |

Content stops at 1280px even on huge displays. Side padding scales with viewport.

### Grids inside the page

| Use | Mobile | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Product grid | 2 cols | 3 cols | 4 cols |
| Discovery sets | 1 col | 2 cols | 3 cols |
| Content/general | 4-col, 16px gutter | 8-col, 24px gutter | 12-col, 32px gutter |

### Radii — 5 values

| Token | px | Use |
|---|---|---|
| `none` | 0 | Surfaces, sections, dividers |
| `sm` | 4 | Inputs, small buttons |
| `md` | 8 | Cards, primary buttons, image containers |
| `lg` | 16 | Sheets, dialogs, the cart panel |
| `pill` | 999 | Badges, status chips |

### Elevation — almost none

The site is Apple-flat. Depth via surface color and 1px borders. Two exceptions:

1. Modal sheets and the cart panel: `0 8px 32px hsla(24 15% 12% / 0.08)`
2. Sticky header on scroll: 1px `--border` bottom, no shadow

Everywhere else: borders or surface color. No drop shadows.

---

## Motion

Every transition explains a relationship. Hover is not a relationship. Tap is not a relationship. Decoration is not.

### Duration tokens

| Token | ms | Use |
|---|---|---|
| `instant` | 100 | Hover color shift, focus ring, button press |
| `quick` | 200 | Default — most UI transitions |
| `standard` | 350 | Modals/sheets, cart panel, page fade |
| `slow` | 600 | Reserved — image zoom on PDP only |

### Easing tokens

- `--ease-default`: `cubic-bezier(0.2, 0, 0, 1)` — for almost everything
- `--ease-linear`: `linear` — only for skeleton shimmer and indeterminate progress

### What gets motion (and why)

| What | Duration | Reason it earns motion |
|---|---|---|
| Cart panel sliding in from right | 350 | Explains "your cart lives on the side" |
| Modal/sheet enter | 350 | Explains "this is overlaid" |
| Sticky-header `border-b` appearing on scroll | 200 | Explains "you've left the top" |
| Skeleton shimmer | 1500, linear | Explains "data is loading" |
| Cart-count badge after add-to-cart | 350 | Single quiet pulse, signals "your action landed" |
| Image zoom click on PDP | 600 | Explains "you're looking closer" |
| Smooth scroll to in-page anchor | 350 | Explains "the page is moving you" |
| Page enter on route change | 200 fade | Quiet hand-off |
| Focus ring appearing on keyboard nav | 100 | Explains "you're at this control" |

### What dies

- `hover:scale-[1.02]` on cards
- `group-hover:scale-110` on images
- `animate-pulse` on non-loading elements
- `animate-bounce` on success
- `animate-fade-in` on initial section load
- Green flash on add-to-cart (replaced by quiet badge pulse)
- Brand-logo marquee (replaced by a static brand wall)
- Auto-advancing ClientReviews carousel (replaced by manual swipe)

### Reduced-motion

Single global rule: under `@media (prefers-reduced-motion: reduce)`, all transition durations collapse to `0ms` except skeleton shimmer (becomes static) and page-enter fade (kept at 100ms).

---

## Primitives

### Button — 3 variants × 3 sizes

| Variant | Look | Use |
|---|---|---|
| Primary | `--mocha` filled, `--paper` text, radius `md`, no shadow | Adaugă în coș, Plasează comanda |
| Secondary | `--paper` filled, 1px `--border`, `--text` color | Vezi setul, secondary CTAs |
| Ghost | No fill or border, `--text` color, hover → `--surface-2` | Toolbar buttons, "Continuă cumpărăturile" |

Sizes: **sm** (32h, body 14), **md** (40h, body 14, default), **lg** (48h, body 16). Hover: 100ms color shift to `--mocha-hover`. Press: instant. Disabled: 50% opacity. Loading: spinner replaces text without width shift.

**No hover-scale, no shadow, no gradient on any variant or state.**

### Input — single appearance

`--surface` background, 1px `--border`, radius `sm`, 12px vertical / 16px horizontal padding, body-sized text. Label sits above the field as `caption` (no floating labels). Focus: 2px outline in `--mocha`, no glow. Error: border becomes `--error`, message body-sm `--error` directly below. Disabled: `--surface-2` background, `--text-faint`.

Same look for text, email, phone, password, textarea, select.

### Card — two roles only

- **Surface card** (product, discovery set, content): `--surface`, `--border` 1px, radius `md`. No hover-scale. No drop-shadow.
- **Plain block**: no border, just spacing. For sections.

### Product card

- Image, 1:1 ratio, `--surface` background, no hover-zoom
- Brand: `caption`, `--text-muted`
- Name: `body`, Regular
- Price: `body`, Regular (not bold)
- No rating stars on the card. Rating lives on the PDP only.
- No badges unless content is genuinely time-sensitive (e.g. "Edition limitată" — caption-tracked, `--mocha` outlined).
- Click target: entire card. Cursor `pointer`. No motion on hover.

### Cart sheet (replaces dropdown)

- **Desktop:** side-sheet from the right, 420px wide, radius `lg`, soft shadow per elevation rules, slides in 350ms.
- **Mobile:** full-viewport sheet from the right with dedicated close button at top.
- Contents: line items (image w-16 h-16, name, brand caption, qty -/+, remove icon, line price), `--border` divider, subtotal / shipping estimate / total, primary CTA "Mergi la checkout."
- The header **cart icon shows count only** — no preview, no totals. Click → sheet opens.

### Header

- Background: `--paper`. Border-bottom only **after scroll** (200ms fade-in of the 1px border).
- Layout: logo (left), nav links (center, hidden on mobile), search-icon + cart-icon (right). 64px tall on desktop, 56px on mobile.
- Search icon click → opens a command-palette-style overlay (max-width 600, centered on desktop, full-viewport on mobile) with the input focused, live results below. Keyboard: ⌘K / Ctrl+K to open, Esc to close.
- Mobile menu: hamburger → full-viewport sheet with same nav links + footer info.
- No text-shadow, no decorative borders, no hover-scale on logo.

### Footer

Two rows.

- **Top row** (64px vertical padding): wordmark (left) · 4 hand-picked links: **Magazin · Despre · Contact · FAQ** (right) · Instagram icon (far right).
- **Bottom row** (caption, `--text-faint`): `Eleganta nu se striga` (left) · `© 2026 Modestshop · Privacy · Termeni` (right).

Cariere, Jurnal-placeholder, and the 6 dead "Companie" links are removed. They remain as routes; reachable from the bottom row + via FAQ + via direct URL.

### Badge / Chip — 2 variants only

Pill, `caption` size, `+0.06em` tracked, **lowercase or sentence-case** (overriding the global "no uppercase" rule for badges with `+0.06em` tracking).

- **Outline:** 1px `--border`, `--text` color
- **Soft:** `--mocha-soft` background, `--text-strong`

No colored variants. The current discovery-set gradient badges become outline badges with text "Personalizabil" or "Pre-asamblat."

### Star rating — text only

PDP only — never on cards. Rating is rendered as `4.6 / 5` in `body` size with a small `caption`-sized review count next to it (`(38 recenzii)`). No visual stars at all. The most disciplined option; if visual stars are missed in QA we can add a single-color (`--mocha`) circle representation, but the default is text.

### Tabs / Accordion / Pagination

- **Tabs:** 2px `--mocha` underline on active. Inactive `--text-muted`. No pills, no shadows.
- **Accordion:** 1px `--border` between items, mocha chevron, 16px vertical padding minimum, body content. No card wrapper, no row striping.
- **Pagination:** `caption`-size links, 16px gap, active page `--mocha`. Previous/Next as text links. Ellipsis is a plain `…`.

---

## Phase boundaries

### Phase 1 (this spec) — what gets built

- New CSS variables in `index.css` for the warm-neutral ramp + mocha + functional colors
- New Tailwind config alignments (or shadcn theme overrides) to expose the type scale, spacing scale, radii, motion durations as design tokens
- Replace global `font-light` body default with `font-normal`
- Remove `select-none` global mobile rule from `index.css`
- Replace existing primitive components with the new versions: Button, Input, Card, Badge, Star Rating
- Build the new CartSheet component and wire it into the Header (replacing the dropdown)
- Rebuild Header (paper background, scroll-aware border, command-palette search overlay)
- Rebuild Footer (2-row, collapsed link grid)
- Remove every gradient utility currently in use across components — pages will look "less decorated" immediately, even before Phase 2 page redesigns
- Remove every `hover:scale-*`, `animate-pulse` (on non-loading elements), `animate-bounce`, `animate-fade-in` from existing components
- Replace yellow rating stars with mocha or text representation
- Remove the brand-logo marquee animation (replace with static brand wall — minimal layout, exact placement deferred to Phase 2 home page redesign)
- Remove the hardcoded longevity/projection progress bars

### Phase 2+ (future specs) — what stays for later

- Page-level redesigns: Home, Shop, PDP, Checkout (Phase 2)
- Discovery sets pages, Order pages, Auth, static pages (Phase 3)
- Admin (Phase 4)

After Phase 1 ships, the site will look quieter and more disciplined immediately because the primitives carry the new system. But page-level layouts (homepage section order, PDP information architecture, etc.) stay as they are until Phase 2.

---

## Out of scope / deferred

- Dark mode (decided: out of scope)
- i18n (sub-project A — paused; the existing copy in components stays Romanian; the Romanian-only constants stay where sub-project A will plug in later)
- Online payment (per memory: payment is off-site via WhatsApp/Telegram)
- New features
- Database changes
- A new logo / wordmark (logo is locked)
- New product photography
- Performance optimization
- SEO restructuring (Phase 3+ may revisit when copy is touched)

## Forward compatibility — i18n

The existing string constants in `src/utils/vat.ts` (`EU_COUNTRY_LABELS`) and `src/utils/shippingEstimate.ts` (`SHIPPING_COPY`) remain the i18n swap points for sub-project A. Phase 1 must not introduce new hardcoded strings inside JSX where the existing pattern is to extract them. New components introduced in Phase 1 (CartSheet, command-palette search overlay) should keep their copy in module-level constants where it's natural to do so.

## Forward compatibility — design system

After Phase 1 ships, the design tokens (CSS variables, Tailwind extended theme) become the **single source of truth**. Phase 2 page redesigns are not allowed to introduce new colors, sizes, spacings, or motion durations outside what this spec defines. If a real need arises, the spec is amended first; tokens are added; then pages use them.
