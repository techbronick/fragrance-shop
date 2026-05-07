# Redesign Phase 2 — Home

**Date:** 2026-04-27
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 2 (page-level redesigns) — second sub-page: **Home (`/`)**
**Status:** spec — awaiting review

## Single job

> The home page tells a first-time visitor what modestshop is in 5 seconds, and gives them one clear next step.

The hero IS the page. Everything below the hero exists to support it.

## Phase context

The PDP redesign (first Phase 2 sub-project) shipped earlier today. The Phase 1 design system + primitives are the substrate. This spec only addresses **layout, hierarchy, content, and component decomposition** for the homepage.

Subsequent Phase 2 sub-projects: Shop, Checkout. Each gets its own spec.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Single job is "what modestshop is in 5 seconds + one clear next step" | Justifies cutting parallel sections that compete for attention |
| 2 | Cut Premium Brands carousel (redundant with BrandWall) | One brand-credibility moment, not two |
| 3 | Pick New Arrivals (auto carousel) over Featured Collection (manual curation) | User chose B in Q2 — no manual curation burden |
| 4 | Discovery moment = "Build your own" CTA (D), not Discovery Boxes grid (C) | User chose D in Q2 — pushes the builder, single decision point |
| 5 | Reviews stay as a section | User instruction |
| 6 | Hero is full-bleed image (~85vh) with text overlay | User chose C/A — cinematic, treats image as primary |
| 7 | Hero text positioned bottom-left with dark gradient overlay for legibility | User chose B + i — gradient overlay is the documented carve-out for image legibility (also used in carousel overlays in Phase 1) |
| 8 | Two CTAs in the hero side-by-side: `Magazin` (primary) + `Descoperă seturi` (secondary ghost) | User chose C — both paths visible to first-time visitors |
| 9 | BrandWall placed immediately after hero (extracted from HeroSection) | User chose i — first credibility hand-off after the brand-voice moment |
| 10 | Hero subhead copy: `Pentru cei care lasă parfumul să vorbească.` | User-refined draft |

## Non-goals

- No new photography pipeline (placeholder image used until user supplies real hero image)
- No DB schema changes
- No new copy beyond the locked hero subhead
- No new features
- No reviews-page route (the existing carousel is the only reviews surface)
- No multi-language support (parked behind redesign)
- No performance work beyond the LCP optimization the hero image already requires
- No analytics events on the new components

## Architecture

### Final page structure

```
Header                                  ← already shipped
─────────────
HeroSection (full-bleed image, ~85vh)   ← rewritten
─────────────
BrandWall                               ← extracted; component already shipped
─────────────
New Arrivals carousel                   ← existing component, repositioned
─────────────
DiscoveryCTA                            ← new component
─────────────
Client Reviews carousel                 ← existing component, repositioned
─────────────
Footer                                  ← already shipped
```

Section gaps: 96px desktop (`mb-24`) / 64px mobile (`mb-16`).

### File map

**Modified:**
- `src/pages/Index.tsx` — restructured to consume the new section list. Drops Premium Brands carousel, Featured Collection, Discovery Boxes grid, the previous Discovery CTA section.
- `src/components/HeroSection.tsx` — full rewrite. Becomes pure full-bleed image hero with overlaid text + 2 CTAs. BrandWall is no longer rendered inside it.

**Created:**
- `src/components/home/DiscoveryCTA.tsx` — new "Build your own" promo block. Single panel with text + primary button → `/discovery-sets?tab=builder`.

**No changes (consumed as-is from Phase 1):**
- `src/components/BrandWall.tsx` — placement changes; component does not.
- `src/components/NewArrivalsCarousel.tsx` — already cleaned in Phase 1, just repositioned in Index.tsx.
- `src/components/ClientReviews.tsx` — already cleaned in Phase 1, just repositioned.

## Hero

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  [hero image — 85vh]                    │
│                                                         │
│                                                         │
│   ╔═══════════════════════════════════════════════════╗ │
│   ║ ←  gradient fade-up from black/50 to transparent  ║ │
│   ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│   Eleganta nu se striga.                                │
│   Pentru cei care lasă parfumul să vorbească.           │
│                                                         │
│   [ Magazin → ]    [ Descoperă seturi ]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Markup outline

```tsx
<section className="relative w-full h-[85vh] min-h-[500px] md:min-h-[600px] overflow-hidden">
  <img
    src={HERO_IMAGE_PATH}
    alt="modestshop — Eleganta nu se striga"
    className="absolute inset-0 w-full h-full object-cover"
    loading="eager"
    decoding="async"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
  <div className="absolute bottom-12 md:bottom-16 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 max-w-2xl">
    <h1 className="text-display md:text-display-md font-light text-paper">
      Eleganta nu se striga.
    </h1>
    <p className="text-body md:text-body-lg text-paper/85 mt-4 max-w-md">
      Pentru cei care lasă parfumul să vorbească.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 mt-8">
      <Button variant="primary" size="lg" onClick={() => navigate('/shop')}>
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
```

### Hero image

- Initial path: `https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=80` (a perfume / fragrance bottle on Unsplash; serves as the placeholder until the user supplies their own image). The `HeroSection.tsx` defines `HERO_IMAGE_PATH` as a single module-level constant — swap-in is a one-line change.
- When the user supplies their own image: drop the file into `public/` (e.g. `public/hero.webp`) and change `HERO_IMAGE_PATH` to `/hero.webp`.
- Format: WebP recommended; ~1920×1080 or larger.
- Alt text: starts as `"modestshop — Eleganta nu se striga"`; should be updated when the real image lands to describe what's actually in the photo.
- LCP optimization: `loading="eager"`, `decoding="async"`. No `<picture>` srcset for now (single image is fine; can be optimized later if performance warrants).

### Gradient overlay carve-out

Phase 1 spec rules out `bg-gradient-*` in JSX. The hero overlay is the documented exception (same exception used in Phase 1 carousel overlays for legibility on photography). It is the only place gradient utilities appear in the home page.

### Mobile

- `h-[85vh] min-h-[500px]` (slightly shorter min)
- Tagline uses mobile `text-display` (36px), not `text-display-md` (56px)
- CTAs stack vertically (`flex-col sm:flex-row`)
- Bottom-left padding shrinks to match mobile outer padding (16px)
- Subhead `max-w-md` keeps line length readable on phones

## BrandWall placement

Extracted from `HeroSection.tsx`; rendered as a top-level section in `Index.tsx` immediately after the hero.

```tsx
<section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24">
  <BrandWall />
</section>
```

No section heading. The logos speak for themselves.

## New Arrivals

```tsx
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
```

- `newArrivals` = `useProducts()` data sorted by `created_at desc`, sliced to 8.
- The existing `<NewArrivalsCarousel>` consumes the products. No changes to its internals.
- If `newArrivals.length === 0`, the entire section is omitted (no empty placeholder).

## Discovery CTA

New component `src/components/home/DiscoveryCTA.tsx`:

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

- The `bg-mocha-soft` panel is the only mocha-soft use on the home page. It marks a deliberate moment (the discovery flow), not page chrome.
- Centered text + button. No icons, no images, no decoration.
- Single primary CTA that lands directly in the builder tab.

## Client Reviews

```tsx
<section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-8">
    Recenzii
  </p>
  <ClientReviews />
</section>
```

- The existing `<ClientReviews>` carousel renders below the eyebrow.
- Already cleaned in Phase 1 (no auto-scroll on mobile, no decoration).
- If reviews data returns empty, the section is omitted.

## Edge cases & states

| Case | Behavior |
|---|---|
| Hero image fails to load | Browser shows alt text in the image area; gradient overlay still visible; text overlay is unaffected. |
| `useProducts()` returns 0 results | New Arrivals section omitted entirely (no broken-looking empty state). |
| `useProducts()` is loading | New Arrivals carousel shows its existing skeleton (already cleaned to use `animate-shimmer`). |
| Reviews data missing | Section omitted. |
| Reduced motion | Carousel transitions collapse to ≤100ms via the global rule from Phase 1. Hero image is static — no parallax, no Ken Burns, no reveal animation. |
| Very short viewport (< 600px tall) | Hero respects `min-h-[500px]` on mobile / `min-h-[600px]` on desktop, ensuring tagline + CTAs remain visible. |
| User scrolls past the hero on a tall display | Header's scroll-aware border (Phase 1) appears at 8px. No special hero-related behavior. |
| User clicks the secondary "Descoperă seturi" CTA | Routes to `/discovery-sets`. The page itself shows the overview tab by default. |

## Functionality preservation

The home page (audit items 49–53 + 73) is preserved:
- Header search ✅ (unchanged — already shipped Phase 1)
- Cart access ✅ (unchanged)
- Discovery sets entry point ✅ (now via the Discovery CTA + the secondary hero CTA)
- Reviews ✅ (kept per user instruction)
- Brand identity / credibility ✅ (BrandWall, repositioned)

Intentional regressions (acknowledged in spec; user-approved during brainstorm):
- Premium Brands carousel ❌ (redundant with BrandWall)
- Featured Collection ❌ (replaced by New Arrivals — user chose B in Q2)
- Discovery Boxes grid ❌ (replaced by Discovery CTA — user chose D in Q2)
- Trust Signals row ❌ (already cut in Phase 1 Task 19)
- Marquee animation ❌ (already replaced in Phase 1 Task 8)

## Forward compatibility

- **Hero image**: when the user supplies the real image, only `HERO_IMAGE_PATH` and the `alt` attribute change. No layout adjustment.
- **i18n (sub-project A)**: hero copy and section eyebrows live as inline JSX strings in this redesign. They become the swap points when i18n resumes. The `Pentru cei care lasă parfumul să vorbească.` subhead and the `Eleganta nu se striga.` tagline are particularly important to preserve through translation.
- **Featured Collection in the future**: if the user later wants manual curation (Q2 Option A), it can sit between the BrandWall and the New Arrivals carousel as a third section. The current design has a hole there that's easy to fill.
- **Lifestyle photography**: when real photo direction lands, the hero image swap is one line. If a multi-image hero ever wants to land (carousel of hero shots), the `<HeroSection>` becomes the swap point.

## Out of scope / deferred

- Reviews submission UI
- A blog / journal feed on the homepage
- Personalized recommendations on the homepage
- Promotional banners or seasonal callouts
- Newsletter signup section
- Instagram embed feed
- Lifestyle / editorial story sections
