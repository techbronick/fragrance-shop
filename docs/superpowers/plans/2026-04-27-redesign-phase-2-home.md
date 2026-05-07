# Redesign Phase 2 — Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a 4-section page with a cinematic full-bleed hero, replacing the current 7-section equal-weight stack. Preserve all critical functionality (search, cart, navigation paths, reviews, brand credibility).

**Architecture:** One new component (`DiscoveryCTA`), one full rewrite (`HeroSection`), and one restructured page (`Index.tsx`). The hero is full-bleed image with overlaid text. BrandWall is extracted from inside HeroSection and rendered as a top-level section. The Premium Brands carousel, Featured Collection, Discovery Boxes grid, and previous Discovery CTA are removed.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens + primitives are the substrate.

**Spec:** `docs/superpowers/specs/2026-04-27-redesign-phase-2-home-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`. Manual QA in Task 4.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits. Save points = build green.
- Path alias `@/*` → `src/*`.
- Phase 1 design tokens (Inter, warm-neutral, mocha, motion) and primitives (Button, BrandWall, NewArrivalsCarousel, ClientReviews) are already in production. New work consumes them.
- The hero subhead `Pentru cei care lasă parfumul să vorbească.` and the tagline `Eleganta nu se striga.` are locked copy — preserve diacritics exactly.

---

## File structure

**Create (1 file):**
- `src/components/home/DiscoveryCTA.tsx` — promo block with primary CTA → `/discovery-sets?tab=builder`

**Modified (2 files):**
- `src/components/HeroSection.tsx` — rewritten as full-bleed image hero with overlaid text + 2 CTAs. BrandWall removed from inside.
- `src/pages/Index.tsx` — restructured: drops Premium Brands carousel, Featured Collection, Discovery Boxes grid, previous Discovery CTA section. Renders Hero → BrandWall → New Arrivals → DiscoveryCTA → Reviews.

---

## Task 1: DiscoveryCTA component

**Files:**
- Create: `src/components/home/DiscoveryCTA.tsx`

The directory `src/components/home/` does not exist yet — create it as part of writing the file.

- [ ] **Step 1: Create the file**

```tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DiscoveryCTA() {
  const navigate = useNavigate();
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
      <div className="bg-mocha-soft rounded-md py-16 md:py-24 px-6 md:px-12 text-center">
        <h2 className="text-h1 md:text-h1-md font-normal text-text-strong">
          Construiește-ți setul
        </h2>
        <p className="text-body md:text-body-lg text-text mt-4 max-w-xl mx-auto">
          Alege 5 sau 10 mostre din catalogul de parfumuri. Decide care merită sticla — fără riscuri.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-8"
          onClick={() => navigate('/discovery-sets?tab=builder')}
        >
          Construiește setul →
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build` from `/Users/bigjeery/Documents/wrk/fragrance-shop-main`
Expected: success.

- [ ] **Step 3: Save point**

The component exists but isn't rendered anywhere yet. Task 3 wires it in.

---

## Task 2: HeroSection rewrite

**Files:**
- Modify: `src/components/HeroSection.tsx` (full file replacement)

The current `HeroSection` is a centered text-on-paper hero with two CTAs and BrandWall embedded. Replace entirely with a full-bleed image hero. BrandWall is extracted (Index.tsx will render it as a separate section in Task 3).

- [ ] **Step 1: Replace `src/components/HeroSection.tsx` entirely**

```tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HERO_IMAGE_PATH =
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=80";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] md:min-h-[600px] overflow-hidden">
      <img
        src={HERO_IMAGE_PATH}
        alt="modestshop — Eleganta nu se striga"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
      {/* Gradient overlay — the documented carve-out for image legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

      <div className="absolute bottom-12 md:bottom-16 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 max-w-2xl">
        <h1 className="text-display md:text-display-md font-light text-paper">
          Eleganta nu se striga.
        </h1>
        <p className="text-body md:text-body-lg text-paper/85 mt-4 max-w-md">
          Pentru cei care lasă parfumul să vorbească.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/shop')}
          >
            Magazin →
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-paper hover:bg-paper/10"
            onClick={() => navigate('/discovery-sets')}
          >
            Descoperă seturi
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

Notes for the engineer:
- The `HERO_IMAGE_PATH` constant is the swap point. When the user supplies their own image, drop it in `public/` (e.g. `public/hero.webp`) and change the constant to `/hero.webp`.
- Diacritics in `Eleganta nu se striga.` and `Pentru cei care lasă parfumul să vorbească.` and `Descoperă` must be preserved exactly.
- The `bg-gradient-to-t` is the explicit carve-out for image legibility (same exception used in carousel overlays in Phase 1). Other gradients in JSX remain forbidden.
- `text-paper/85` and `bg-paper/10` use Tailwind's opacity-on-color syntax — supported by the Phase 1 Tailwind config.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. The build catches any unused imports from the old HeroSection (e.g. `ArrowRight`, `BrandWall`) — they're already gone from the new content.

- [ ] **Step 3: Save point**

HeroSection now renders the new full-bleed hero. BrandWall is no longer rendered inside it; Task 3 hoists BrandWall to a top-level section in Index.tsx.

---

## Task 3: Restructure Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx` (full file replacement)

The current `Index.tsx` is ~300+ lines mixing useProducts, useDiscoverySets queries, featured-product brand-deduplication logic, multiple sections (BrandsCarousel, Featured Collection, Discovery Boxes, NewArrivalsCarousel, ClientReviews, Discovery CTA). Replace entirely.

- [ ] **Step 1: Replace `src/pages/Index.tsx` entirely**

```tsx
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { BrandWall } from "@/components/BrandWall";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import ClientReviews from "@/components/ClientReviews";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useProducts } from "@/hooks/useProducts";
import Seo from "@/components/Seo";

const Index = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();

  // New Arrivals = most recently created products, top 8.
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title="modestshop — Eleganta nu se striga"
        description="Parfumuri rare din maisons curatoriate. Mostre întâi, sticla când ești sigur. Livrare în Moldova și UE."
        image=""
        url=""
        type="website"
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection />

        {/* Brand wall */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24">
          <BrandWall />
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
            <div className="flex items-baseline justify-between mb-8">
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
                Noutăți
              </p>
              <Link
                to="/shop?sort=newest"
                className="text-caption text-text-muted hover:text-text duration-instant ease-default"
              >
                Vezi toate →
              </Link>
            </div>
            <NewArrivalsCarousel products={newArrivals} />
          </section>
        )}

        {/* Discovery CTA */}
        <DiscoveryCTA />

        {/* Reviews */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-8">
            Recenzii
          </p>
          <ClientReviews />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
```

Notes for the engineer:
- **`<NewArrivalsCarousel products={newArrivals} />`**: confirm that `NewArrivalsCarousel` accepts a `products` prop. If it doesn't (the existing component may fetch internally), inspect `src/components/NewArrivalsCarousel.tsx` and adapt: either add a `products?` prop with fallback to the internal fetch, OR simply render `<NewArrivalsCarousel />` without passing products and trust its internal logic (which sorts by recency anyway). Choose based on what the component actually expects.
- All previous imports — `BrandsCarousel`, `SalesCarousel`, `ProductCard`, `useDiscoverySetConfigs`, `useDiscoverySetConfigsWithItems`, `Button`, `Card`, `CardContent`, `Badge`, `ArrowRight`, `Sparkles`, `Gift`, `Award`, `Users`, `Package`, `formatPrice` — are gone.
- All previous sections — Premium Brands carousel, Featured Collection, Discovery Boxes grid, the previous Discovery CTA section, the `featuredProducts` brand-deduplication logic — are gone.

- [ ] **Step 2: Inspect `NewArrivalsCarousel` if needed**

If Step 1's build fails because `NewArrivalsCarousel` doesn't accept a `products` prop, open `src/components/NewArrivalsCarousel.tsx`. Two options:

**Option A — adapt the component:** add a `products?: Product[]` prop. When provided, use it; when absent, keep current behavior. Lowest blast radius.

**Option B — simplify the call site:** drop the prop in Index.tsx, render `<NewArrivalsCarousel />` standalone. The component already fetches its own data sorted by recency, so the resulting UI is equivalent.

Pick Option B unless the existing component is genuinely too coupled to its internal fetching to leave alone.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Save point**

Homepage now consists of: Header → Hero (full-bleed) → BrandWall → New Arrivals → DiscoveryCTA → Reviews → Footer. Down from 7 sections to 4.

---

## Task 4: Full verification + manual QA

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Manual QA — desktop**

Navigate to `/` (home). Mark ✅/❌:

1. **Hero is full-bleed.** Image fills viewport width (no max-width container). Height is ~85vh — 1 scroll-tick reveals the BrandWall section below.
2. **Hero image** loads (Unsplash URL serves until user supplies their own). Visible without layout shift.
3. **Gradient overlay** at the bottom of the hero (`from-black/50 via-black/10 to-transparent`). Tagline + subhead are legible against the photo.
4. **Tagline** `Eleganta nu se striga.` displays in `text-display-md` (56px), Light 300 weight, in `text-paper` color (warm off-white). Diacritics intact.
5. **Subhead** `Pentru cei care lasă parfumul să vorbească.` in `text-body-lg`, slightly transparent paper. Diacritics intact (`lasă`, `vorbească`).
6. **CTAs**: `Magazin →` (primary mocha) + `Descoperă seturi` (ghost, paper-tinted on hover). Side-by-side on desktop.
7. **Click `Magazin →`** → navigates to `/shop`.
8. **Click `Descoperă seturi`** → navigates to `/discovery-sets`.
9. **BrandWall section** appears immediately after the hero. Static logo grid; no scroll animation.
10. **New Arrivals section** below BrandWall. Eyebrow `Noutăți` (uppercase, tracked). `Vezi toate →` link top-right. Carousel renders 8 most-recent products. Section hidden if no products.
11. **DiscoveryCTA section** below New Arrivals. `bg-mocha-soft` panel with centered title `Construiește-ți setul`, body copy, primary CTA `Construiește setul →`.
12. **Click `Construiește setul →`** → navigates to `/discovery-sets?tab=builder`.
13. **Reviews section** below DiscoveryCTA. Eyebrow `Recenzii`. Existing carousel renders.
14. **Footer** appears at the bottom (the Phase 1 footer with the tagline in the bottom row).

- [ ] **Step 4: Manual QA — what's gone**

Verify these are absent from the homepage:
15. **No Premium Brands carousel** — only the static BrandWall remains as the brand-credibility moment.
16. **No Featured Collection** 3-col grid — replaced by New Arrivals carousel.
17. **No Discovery Boxes** 4-card grid — replaced by the single DiscoveryCTA panel.
18. **No previous Discovery Sets CTA** section (the older one with icon bullets and a 2-col image layout) — replaced by DiscoveryCTA.
19. **No Trust Signals row** (already removed in Phase 1).
20. **No marquee animation** anywhere (already removed in Phase 1).

- [ ] **Step 5: Manual QA — mobile**

Resize browser to ~375px or use mobile devtools.

21. **Hero collapses gracefully.** Image still fills viewport width. Tagline uses `text-display` (36px). Subhead `text-body` (16px). CTAs stack vertically (primary on top).
22. **CTAs are tap-friendly** (full width or comfortable padding).
23. **BrandWall** shifts to 2 or 3 columns on mobile (per the Phase 1 BrandWall responsive grid).
24. **New Arrivals carousel** swipes horizontally; arrows hidden, dots visible.
25. **DiscoveryCTA panel** padding shrinks but layout holds (text + button still readable, button still tappable).
26. **Reviews carousel** swipes manually (no auto-advance).

- [ ] **Step 6: Manual QA — interactions**

27. Header search icon click → search overlay opens (Phase 1 work, should still function).
28. Header cart icon → CartSheet opens (Phase 1 work).
29. Tab through hero CTAs → focus rings appear in mocha (Phase 1 system).
30. Reduced-motion enabled at OS level → carousel transitions collapse to ≤100ms.

- [ ] **Step 7: Stop dev server**

Ctrl-C the running `npm run dev`.

- [ ] **Step 8: Final save point**

Home redesign complete. 1 new component, 2 file rewrites. Homepage is 4 sections instead of 7, with the hero carrying the brand voice.

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Decision 1 (single job — hero is the page) → Task 2 hero rewrite + Task 3 stripped sections
  - Decision 2 (cut Premium Brands carousel) → Task 3 (BrandsCarousel import dropped)
  - Decision 3 (New Arrivals over Featured) → Task 3 (NewArrivalsCarousel kept; featuredProducts logic dropped)
  - Decision 4 (DiscoveryCTA over Discovery Boxes grid) → Task 1 + Task 3 (Discovery Boxes section dropped)
  - Decision 5 (Reviews stay) → Task 3 (ClientReviews kept)
  - Decision 6 (full-bleed image hero, ~85vh) → Task 2
  - Decision 7 (bottom-left text + dark gradient overlay) → Task 2
  - Decision 8 (two CTAs side-by-side) → Task 2
  - Decision 9 (BrandWall after hero) → Task 3 (BrandWall extracted, hoisted to top-level section)
  - Decision 10 (subhead copy locked) → Task 2 (verbatim)
- **Placeholders:** None. Every code-changing step contains the full final code. Task 4's QA list has 30 concrete checks.
- **Type/name consistency:** `HERO_IMAGE_PATH`, `DiscoveryCTA`, `newArrivals`, `BrandWall`, `NewArrivalsCarousel`, `ClientReviews` — used verbatim in all tasks. Diacritics (`Eleganta`, `lasă`, `vorbească`, `Descoperă`, `Construiește`, `Recenzii`, `Noutăți`) preserved in every code block.
- **NewArrivalsCarousel prop fallback** documented in Task 3 Step 2: if the existing component doesn't accept a `products` prop, the engineer is told exactly which two paths to consider, with a clear default (Option B — drop the prop, let the component fetch internally).
