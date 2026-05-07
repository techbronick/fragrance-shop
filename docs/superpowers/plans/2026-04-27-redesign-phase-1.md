# Redesign Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the design system foundations + primitives + global decoration removal + Header/Footer rebuild for modestshop.md, leaving every existing feature working but the visual layer measurably quieter and more disciplined. Page-level layout redesigns are deferred to Phase 2.

**Architecture:** Two foundation files (`tailwind.config.ts` + `src/index.css`) carry the new tokens. Five existing primitives (`Button`, `Input`, `Card`, `Badge`, `Skeleton`) are simplified to match the system. `ProductCard`, `Header`, `Footer`, the marquee, the notes pyramid, and the longevity bars are rebuilt or removed in place. Two new components (`CartSheet`, `SearchOverlay`) replace the cluttered Header dropdowns. Three global passes remove every gradient, every hover-scale, and every icon-in-disc pattern across the 30 files that use them.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/Radix, `@tanstack/react-query`, Supabase JS, Inter (Google Fonts).

**Spec:** `docs/superpowers/specs/2026-04-27-redesign-phase-1-design-system.md`

**Environment notes:**
- No test runner. Verification = `npm run build` (runs `tsc && vite build`). Manual QA at the end (Task 20).
- Project ESLint config is pre-broken (extends `next/core-web-vitals` despite Vite stack). Skip `npm run lint` everywhere.
- Directory is not a git repo. No `git commit` steps. "Save point" = build is green and tree is clean.
- Path alias `@/*` → `src/*`.
- 30 files (listed inline in cleanup tasks) contain decoration patterns being removed. Memorize this list — it's the global blast radius.
- Tasks 1–5 are foundation and must be applied in order. Tasks 6–14 can be applied in any order but build on the foundation. Tasks 15–19 build on earlier work. Task 20 verifies everything.

---

## File Structure

**Modified — foundation (2):**
- `tailwind.config.ts` — extend theme with new tokens
- `src/index.css` — CSS variables, body defaults, kill `select-none`, swap font import

**Modified — primitives (5):**
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/skeleton.tsx`

**Modified — domain components & pages:**
- `src/components/ProductCard.tsx`, `src/components/ProductListCard.tsx`
- `src/components/BrandLogosMarquee.tsx` (deleted; replaced by static wall)
- `src/components/BrandCard.tsx`, `src/components/BrandsCarousel.tsx`, `src/components/ClientReviews.tsx`, `src/components/NewArrivalsCarousel.tsx`, `src/components/SalesCarousel.tsx`, `src/components/HeroSection.tsx`, `src/components/Footer.tsx`, `src/components/Header.tsx`
- `src/components/discovery/*.tsx`
- `src/components/ui/optimized-image.tsx`
- `src/pages/Index.tsx`, `src/pages/Product.tsx`, `src/pages/Shop.tsx`, `src/pages/Checkout.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx`, `src/pages/FAQ.tsx`, `src/pages/Careers.tsx`, `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, `src/pages/OrderConfirmation.tsx`, `src/pages/DiscoverySets.tsx`, `src/pages/DiscoverySetProduct.tsx`

**Created (3):**
- `src/components/BrandWall.tsx` — static replacement for the marquee
- `src/components/CartSheet.tsx` — full cart sheet replacing the Header dropdown
- `src/components/SearchOverlay.tsx` — command-palette-style search overlay

---

## SUB-PHASE A — Foundation (Tasks 1–5)

These are sequential. Each later primitive depends on the tokens from Task 1.

---

### Task 1: Design tokens — Tailwind config + CSS variables

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css` (top section: font import + `:root` block + body defaults + mobile rules)

This task is large because it touches the foundation of every other task. Apply edits in order.

- [ ] **Step 1: Replace `tailwind.config.ts` entirely**

Replace the contents of `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
      },
      screens: {
        '2xl': '1280px', // content stops growing here, per spec
      },
    },
    extend: {
      // All tokens are EXTEND-only so Tailwind defaults stay intact.
      // The previous plan draft replaced fontSize/spacing/borderRadius outright,
      // which would have broken every existing `h-10`, `text-2xl`, `rounded-lg`,
      // `duration-300` in the codebase. Discipline comes from code review +
      // cleanup tasks, not by stripping defaults.
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 7-token scale. Mobile sizes; desktop overrides via `md:` utilities.
        'caption':  ['13px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'body':     ['16px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'body-lg':  ['18px', { lineHeight: '1.5',  letterSpacing: '0' }],
        'h3':       ['18px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h2':       ['22px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h1':       ['28px', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'display':  ['36px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        // Desktop overrides
        'h3-md':       ['20px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h2-md':       ['24px', { lineHeight: '1.3',  letterSpacing: '0' }],
        'h1-md':       ['36px', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'display-md':  ['56px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
      },
      // No `spacing` extension needed — Tailwind's defaults already include
      // 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px, 24=96px.
      // Our 9-token scale IS Tailwind's default subset; we just don't use the
      // off-grid values (5, 7, 9, 10, 11, 14, 18, 20, 28, etc.) by convention.
      borderRadius: {
        // Override Tailwind defaults to match the spec exactly.
        // Default sm=2px → spec sm=4px. Default md=6px → spec md=8px.
        // Default lg=8px → spec lg=16px. Pill is new.
        // (`extend` merges these into the theme; unspecified keys like
        // `rounded-xl`, `rounded-2xl`, `rounded-full`, `rounded-none`
        // keep their Tailwind defaults.)
        sm:   '4px',
        md:   '8px',
        lg:   '16px',
        pill: '9999px',
      },
      transitionDuration: {
        'instant':  '100ms',
        'quick':    '200ms',
        'standard': '350ms',
        'slow':     '600ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      colors: {
        paper:        'hsl(var(--paper))',
        surface:      'hsl(var(--surface))',
        'surface-2':  'hsl(var(--surface-2))',
        border:       'hsl(var(--border))',
        'text-faint':  'hsl(var(--text-faint))',
        'text-muted':  'hsl(var(--text-muted))',
        text:          'hsl(var(--text))',
        'text-strong': 'hsl(var(--text-strong))',
        mocha:         'hsl(var(--mocha))',
        'mocha-hover': 'hsl(var(--mocha-hover))',
        'mocha-soft':  'hsl(var(--mocha-soft))',
        success:       'hsl(var(--success))',
        error:         'hsl(var(--error))',
        // shadcn legacy aliases — kept so existing components compile until they're refactored.
        // These point to the new tokens so the visual is correct; later tasks remove the aliases.
        background:           'hsl(var(--paper))',
        foreground:           'hsl(var(--text))',
        primary: {
          DEFAULT:    'hsl(var(--mocha))',
          foreground: 'hsl(var(--paper))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--surface-2))',
          foreground: 'hsl(var(--text))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--error))',
          foreground: 'hsl(var(--paper))',
        },
        muted: {
          DEFAULT:    'hsl(var(--surface-2))',
          foreground: 'hsl(var(--text-muted))',
        },
        accent: {
          DEFAULT:    'hsl(var(--mocha-soft))',
          foreground: 'hsl(var(--text-strong))',
        },
        popover: {
          DEFAULT:    'hsl(var(--surface))',
          foreground: 'hsl(var(--text))',
        },
        card: {
          DEFAULT:    'hsl(var(--surface))',
          foreground: 'hsl(var(--text))',
        },
        input:        'hsl(var(--border))',
        ring:         'hsl(var(--mocha))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 1.5s linear infinite',
        // 'fade-in' removed deliberately — see spec.
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
  ],
} satisfies Config;
```

Notes for the engineer:
- The shadcn legacy aliases (`background`, `primary`, `secondary`, `muted`, etc.) are intentionally pointed at the new tokens so existing JSX continues to work. Later cleanup tasks will replace `bg-primary/10` etc. with `bg-mocha-soft` directly, but for now the build stays green.
- All token additions live under `theme.extend`, not directly under `theme`. This preserves Tailwind's default `spacing`, `fontSize`, `borderRadius`, `transitionDuration` scales — without that, every existing `h-10`, `text-2xl`, `rounded-lg`, `duration-300` in the codebase would fail to compile. The discipline ("9 spacing values, 7 type tokens, 5 radii") is enforced by code review and the cleanup tasks (12–14), not by stripping defaults.
- `fontSize` introduces named tokens (`text-display`, `text-h1`, `text-body-lg`, etc.) **alongside** Tailwind defaults. New JSX uses the named tokens; cleanup tasks migrate existing JSX off the defaults.
- Radius keys `sm`/`md`/`lg`/`pill` are overridden under `extend.borderRadius` to match the spec values exactly (4/8/16/9999). Existing JSX using `rounded-md` etc. will visually adopt the new sizes — that's the intent; the design system is now the source of truth for radii.

- [ ] **Step 2: Replace the `:root` block + body rules in `src/index.css`**

Find the existing block at the top of `src/index.css` (the `@import` line through the bottom of the mobile-specific overrides — roughly the first 100 lines). Replace it with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Warm-neutral ramp */
    --paper:        30 20% 99%;
    --surface:       0  0% 100%;
    --surface-2:    30 15% 96%;
    --border:       25 10% 88%;
    --text-faint:   25  8% 60%;
    --text-muted:   25  8% 45%;
    --text:         24 12% 22%;
    --text-strong: 24 15% 12%;

    /* Mocha anchor */
    --mocha:        24 25% 25%;
    --mocha-hover:  24 25% 18%;
    --mocha-soft:   24 22% 92%;

    /* Functional */
    --success:      90 15% 35%;
    --error:         5 50% 38%;

    /* shadcn legacy variables — pointed at new tokens.
       Existing components still read these via Tailwind aliases above. */
    --background: var(--paper);
    --foreground: var(--text);
    --card: var(--surface);
    --card-foreground: var(--text);
    --popover: var(--surface);
    --popover-foreground: var(--text);
    --primary: var(--mocha);
    --primary-foreground: var(--paper);
    --secondary: var(--surface-2);
    --secondary-foreground: var(--text);
    --muted: var(--surface-2);
    --muted-foreground: var(--text-muted);
    --accent: var(--mocha-soft);
    --accent-foreground: var(--text-strong);
    --destructive: var(--error);
    --destructive-foreground: var(--paper);
    --border-color: var(--border);
    --input: var(--border);
    --ring: var(--mocha);

    --radius: 8px;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-paper text-text;
    /* Body weight is Regular (400) — Light is reserved for the display token. */
    font-weight: 400;
    font-family: 'Inter', system-ui, sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    overflow-x: hidden;
  }

  /* Headings inherit family + body color; size + weight come from utility classes. */
  h1, h2, h3, h4, h5, h6 {
    font-family: inherit;
  }
}

/* Mobile-specific fixes — limited to overflow control.
   The previous global `user-select: none` is removed (per spec diagnosis #8). */
@media (max-width: 768px) {
  body, html {
    overflow-x: hidden !important;
    overflow-y: auto !important;
    width: 100vw;
    max-width: 100vw;
  }

  img {
    -webkit-touch-callout: none;
    user-select: none;
  }

  /* Inputs and editable areas keep selection (was the only safe-listed case before;
     here we extend it: ALL non-image elements may be selected). */
}

/* `prefers-reduced-motion` — collapse durations to 0 except shimmer (becomes static)
   and route fades (kept at instant). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 100ms !important;
    scroll-behavior: auto !important;
  }
}

/* Skeleton shimmer base style — used by Skeleton primitive in Task 5. */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--surface-2)) 0%,
    hsl(var(--border)) 50%,
    hsl(var(--surface-2)) 100%
  );
  background-size: 200% 100%;
}
```

Notes:
- The Playfair Display import is removed.
- The global `user-select: none` rule from the previous mobile block is gone — customers can copy product names and prices on mobile again.
- `font-light` from the body default is removed; body is `font-weight: 400`.
- The mocha-soft variable becomes the swap-in for every existing `bg-primary/10` use.
- Headings now have **no opinion** — they get family from `body` and size + weight from utility classes (`.text-h1.font-medium` etc.).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds. Some pages will look "off" because they haven't been refactored yet — that's fine. The site still renders, types still check.

- [ ] **Step 4: Save point**

Tokens are live. Existing pages still render. Subsequent tasks build on these tokens.

---

### Task 2: Button primitive

**Files:**
- Modify: `src/components/ui/button.tsx`

The existing shadcn-default button has multiple variants and a `default` size with shadow. We collapse to 3 variants × 3 sizes per spec.

- [ ] **Step 1: Read the current file**

Read `src/components/ui/button.tsx`. Note the export shape (`buttonVariants`, `Button`, props interface).

- [ ] **Step 2: Replace the variant config**

Replace the `buttonVariants` definition (the `cva(...)` call near the top) with:

```tsx
const buttonVariants = cva(
  // base
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium " +
  "transition-colors duration-instant ease-default " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:   "bg-mocha text-paper hover:bg-mocha-hover",
        secondary: "bg-surface text-text border border-border hover:bg-surface-2",
        ghost:     "bg-transparent text-text hover:bg-surface-2",
        // shadcn legacy aliases — point them at the new variants so old call sites still work
        default:     "bg-mocha text-paper hover:bg-mocha-hover",
        outline:     "bg-surface text-text border border-border hover:bg-surface-2",
        link:        "bg-transparent text-mocha underline-offset-4 hover:underline",
        destructive: "bg-error text-paper hover:opacity-90",
      },
      size: {
        sm:   "h-8 px-3 text-caption",
        md:   "h-10 px-4 text-body",
        lg:   "h-12 px-6 text-body-lg",
        icon: "h-10 w-10",
        default: "h-10 px-4 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```

The `default`, `outline`, `link`, `destructive` legacy aliases are kept because they're used in 30+ places across the codebase. Later cleanup may converge them onto `primary`/`secondary`/`ghost` but that's not in scope for this task.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds. Existing buttons render with the new look immediately because every variant maps to the new colors.

- [ ] **Step 4: Save point**

Buttons across the site now use mocha + paper, no shadows, no gradients, no hover-scale.

---

### Task 3: Input primitive

**Files:**
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`

- [ ] **Step 1: Read both files**

Read `src/components/ui/input.tsx` and `src/components/ui/textarea.tsx` to confirm the shape (forwardRef, base classes).

- [ ] **Step 2: Replace the className in `input.tsx`**

Find the long className string in the Input component (around line 8–10) and replace it with:

```tsx
"flex h-10 w-full rounded-sm border border-border bg-surface px-4 py-2 text-body " +
"text-text placeholder:text-text-faint " +
"transition-colors duration-instant ease-default " +
"focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-0 " +
"disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-faint " +
"file:border-0 file:bg-transparent file:text-body file:font-medium"
```

- [ ] **Step 3: Replace the className in `textarea.tsx`**

Apply the equivalent — same base styles, no `h-10`:

```tsx
"flex min-h-[80px] w-full rounded-sm border border-border bg-surface px-4 py-3 text-body " +
"text-text placeholder:text-text-faint " +
"transition-colors duration-instant ease-default " +
"focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-0 " +
"disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-faint"
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Save point**

All inputs and textareas across the site now have the disciplined appearance.

---

### Task 4: Card primitive

**Files:**
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Update the Card root component**

Find the `Card` component definition (root forwardRef) and replace its className with:

```tsx
"rounded-md border border-border bg-surface text-text"
```

(Drop any `shadow-sm`, `shadow-md`, or shadow utilities that exist on the current root.)

CardHeader, CardTitle, CardContent, CardFooter, CardDescription stay as-is — only the root `Card` shadow gets removed.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Save point**

Cards across the site no longer carry shadows.

---

### Task 5: Badge primitive

**Files:**
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Replace the variant config**

Find `badgeVariants` and replace its config with:

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-3 py-1 text-caption " +
  "tracking-[0.06em] uppercase font-medium " +
  "transition-colors duration-instant ease-default",
  {
    variants: {
      variant: {
        outline: "border-border text-text bg-transparent",
        soft:    "border-transparent bg-mocha-soft text-text-strong",
        // legacy aliases pointing at the new variants
        default:     "border-border text-text bg-transparent",
        secondary:   "border-transparent bg-mocha-soft text-text-strong",
        destructive: "border-transparent bg-error text-paper",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);
```

- [ ] **Step 2: Skeleton primitive — replace shimmer**

Open `src/components/ui/skeleton.tsx`. Replace its className with:

```tsx
"animate-shimmer rounded-sm skeleton-shimmer"
```

(`animate-shimmer` is defined in Task 1's Tailwind config; `.skeleton-shimmer` class is in `index.css`.)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Save point**

Badges and skeletons match the system. **End of Sub-Phase A — Foundation.**

---

## SUB-PHASE B — Component-level changes (Tasks 6–11)

Each task is independent of the others and depends only on Sub-Phase A.

---

### Task 6: ProductCard + ProductListCard — strip decoration

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductListCard.tsx`

- [ ] **Step 1: ProductCard — remove hover-scale and image-zoom**

Open `src/components/ProductCard.tsx`. Strip every:
- `hover:scale-[1.02]`, `hover:scale-105`, `transition-all`, `transition-transform`
- `group-hover:scale-110` on the image
- Any `bg-gradient-*`, `from-*`, `to-*`, `via-*` overlay
- Any rating-related JSX (yellow stars, rating text). The card no longer displays a rating.
- Any badge that appears on the card (per spec — badges only for genuinely time-sensitive content; default is nothing).

Keep:
- The image (1:1 aspect ratio, plain `bg-surface`)
- Brand caption (use `text-caption text-text-muted`)
- Product name (use `text-body`)
- Price (use `text-body`)
- Click target = entire card.

If the card uses `font-playfair` for the name, change it to nothing (default is Inter via body).

- [ ] **Step 2: ProductListCard — same treatment**

Apply the equivalent strip to `src/components/ProductListCard.tsx`. The list-row layout stays; the decorations don't.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

Product cards in grid and list views are quiet. The product imagery and type carry the design.

---

### Task 7: Star rating — text only

**Files:**
- Create: `src/components/Rating.tsx`
- Modify: `src/pages/Product.tsx`

- [ ] **Step 1: Create the Rating component**

Create `src/components/Rating.tsx`:

```tsx
type Props = {
  value: number;        // e.g. 4.6
  count: number;        // e.g. 38
  className?: string;
};

export function Rating({ value, count, className }: Props) {
  return (
    <div className={`flex items-baseline gap-2 ${className ?? ''}`}>
      <span className="text-body text-text">
        {value.toFixed(1)} / 5
      </span>
      <span className="text-caption text-text-muted">
        ({count} {count === 1 ? 'recenzie' : 'recenzii'})
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Replace the rating block in `src/pages/Product.tsx`**

Find every JSX block in `Product.tsx` that uses `fill-yellow-400 text-yellow-400` or `Star` icons rendering ratings. Replace each with:

```tsx
<Rating value={product.rating} count={product.review_count} />
```

(Import the new component at the top: `import { Rating } from "@/components/Rating";`)

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

PDP shows `4.6 / 5 (38 recenzii)` instead of yellow stars.

---

### Task 8: Brand wall — replace marquee with static grid

**Files:**
- Create: `src/components/BrandWall.tsx`
- Delete: `src/components/BrandLogosMarquee.tsx`
- Modify: any file that imports `BrandLogosMarquee` (likely `src/pages/Index.tsx`)

- [ ] **Step 1: Create the static replacement**

Create `src/components/BrandWall.tsx`:

```tsx
import { brandImages } from "@/utils/brandImages";

/**
 * Static replacement for the previous animated marquee.
 * Brands sit in a quiet grid; no scroll, no animation.
 */
export function BrandWall() {
  const brands = Object.entries(brandImages);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 items-center">
      {brands.map(([name, src]) => (
        <div
          key={name}
          className="flex items-center justify-center h-16 opacity-70 hover:opacity-100 transition-opacity duration-quick ease-default"
        >
          <img
            src={src}
            alt={name}
            className="max-h-12 max-w-full object-contain"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
```

(If `brandImages` doesn't export an `Object`-shaped record, adapt the iteration accordingly. Check `src/utils/brandImages.ts` first.)

- [ ] **Step 2: Update homepage import**

Open `src/pages/Index.tsx`. Find the `import BrandLogosMarquee` line. Replace with:

```tsx
import { BrandWall } from "@/components/BrandWall";
```

Find the `<BrandLogosMarquee />` JSX usage. Replace with:

```tsx
<BrandWall />
```

- [ ] **Step 3: Delete the marquee file**

Delete `src/components/BrandLogosMarquee.tsx`. The component and its custom `@keyframes marquee` animation go with it.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds. If `tsc` errors that something else still imports `BrandLogosMarquee`, grep for usages and update them.

- [ ] **Step 5: Save point**

The brand identity is shown via a static, properly-typeset wall — no treadmill.

---

### Task 9: Notes pyramid — quiet rows

**Files:**
- Modify: `src/pages/Product.tsx`

- [ ] **Step 1: Find the existing 3-card pyramid**

In `src/pages/Product.tsx`, find the JSX that renders the notes pyramid — three cards using `bg-gradient-to-r from-yellow-100 to-orange-100`, `from-pink-100 to-purple-100`, `from-amber-100 to-brown-100` with `border-l-4` accents.

- [ ] **Step 2: Replace with quiet rows**

Replace the entire pyramid block with:

```tsx
{(product.notes_top?.length || product.notes_mid?.length || product.notes_base?.length) ? (
  <div className="space-y-6">
    <h3 className="text-h2 md:text-h2-md font-medium text-text-strong">Note olfactive</h3>
    <div className="space-y-4">
      {product.notes_top?.length ? (
        <div className="flex items-baseline gap-6 py-3 border-b border-border">
          <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-24 shrink-0">
            Vârf
          </span>
          <span className="text-body text-text">
            {product.notes_top.join(', ')}
          </span>
        </div>
      ) : null}
      {product.notes_mid?.length ? (
        <div className="flex items-baseline gap-6 py-3 border-b border-border">
          <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-24 shrink-0">
            Inimă
          </span>
          <span className="text-body text-text">
            {product.notes_mid.join(', ')}
          </span>
        </div>
      ) : null}
      {product.notes_base?.length ? (
        <div className="flex items-baseline gap-6 py-3">
          <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-24 shrink-0">
            Bază
          </span>
          <span className="text-body text-text">
            {product.notes_base.join(', ')}
          </span>
        </div>
      ) : null}
    </div>
  </div>
) : null}
```

Three quiet rows, eyebrow labels, no gradients, no colored borders, no left-border accents.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

Notes pyramid is now a disciplined three-row block.

---

### Task 10: Remove longevity / projection progress bars

**Files:**
- Modify: `src/pages/Product.tsx`

- [ ] **Step 1: Find and delete the bars**

In `src/pages/Product.tsx`, find the JSX block that renders the green-gradient longevity bar and the blue-gradient projection bar (search for `bg-gradient-to-r from-green-500` or `Longevity` or `Projection`). The values are hardcoded (75% / 65%) per the audit.

Delete the entire block — both bars, the surrounding `Performance Info` section heading, and any nearby explanatory note box.

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Save point**

Fictional graphs are gone; the page is shorter and more honest.

---

### Task 11: Discovery-set badges — outline labels

**Files:**
- Modify: `src/pages/DiscoverySets.tsx`
- Modify: `src/pages/DiscoverySetProduct.tsx`
- Modify: any other component rendering the gradient discovery-set badge

- [ ] **Step 1: Search for the gradient pattern**

Run a project-wide search for `from-purple-500 to-pink-500` (the customizable-set badge) and `Pentru Ea` / `Pentru El` color overrides.

- [ ] **Step 2: Replace each with the outline Badge variant**

Replace each gradient badge JSX with:

```tsx
<Badge variant="outline">Personalizabil</Badge>
```

or `<Badge variant="outline">Pre-asamblat</Badge>` depending on which the original was. The "Pentru Ea" / "Pentru El" pink/blue colored badges become outline badges with the same text but no color override.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

Discovery-set badges are quiet outlined labels. Visual differentiation from regular cards comes from the layout, not the color of a sticker.

---

## SUB-PHASE C — Global decoration cleanup (Tasks 12–14)

These are search-and-replace passes across the codebase. The 30 files containing decoration patterns:

```
src/components/BrandCard.tsx
src/components/BrandsCarousel.tsx
src/components/ClientReviews.tsx
src/components/Footer.tsx
src/components/Header.tsx
src/components/HeroSection.tsx
src/components/NewArrivalsCarousel.tsx
src/components/ProductCard.tsx          ← already cleaned in Task 6
src/components/ProductListCard.tsx      ← already cleaned in Task 6
src/components/SalesCarousel.tsx
src/components/discovery/DiscoveryProductCard.tsx
src/components/discovery/DiscoveryRecommendation.tsx
src/components/discovery/DiscoverySetActions.tsx
src/components/discovery/DiscoverySetBuilder.tsx
src/components/ui/optimized-image.tsx
src/components/ui/skeleton.tsx          ← already updated in Task 5
src/pages/About.tsx
src/pages/Careers.tsx
src/pages/Contact.tsx
src/pages/DiscoverySetProduct.tsx
src/pages/DiscoverySets.tsx
src/pages/FAQ.tsx
src/pages/Index.tsx
src/pages/OrderConfirmation.tsx
src/pages/Privacy.tsx
src/pages/Product.tsx                   ← partially cleaned in Tasks 7, 9, 10
src/pages/Shop.tsx
src/pages/Terms.tsx
```

Each cleanup task uses **rule-based judgment** rather than a single mechanical replacement, because the patterns appear in slightly different forms.

---

### Task 12: Remove gradient utilities

**Files:** any of the 30 files above containing the patterns below.

- [ ] **Step 1: Find all gradient occurrences**

Run from the project root:

```bash
grep -rE "bg-gradient|from-[a-z]+|via-[a-z]+|to-[a-z]+" src --include="*.tsx" -n
```

(Use the Grep tool — same query.)

- [ ] **Step 2: Apply rules per occurrence**

For each occurrence:

| Original pattern | Replacement |
|---|---|
| `bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10` | Remove. Section gets plain `bg-paper`. |
| `bg-gradient-to-r from-yellow-100 to-orange-100` (notes pyramid top) | Already removed in Task 9. |
| `bg-gradient-to-r from-pink-100 to-purple-100` (notes pyramid heart) | Already removed in Task 9. |
| `bg-gradient-to-r from-amber-100 to-brown-100` (notes pyramid base) | Already removed in Task 9. |
| `bg-gradient-to-r from-green-500 to-emerald-600` (progress bars) | Already removed in Task 10. |
| `bg-gradient-to-r from-purple-500 to-pink-500` (customizable badge) | Already replaced in Task 11. |
| Any other `bg-gradient-*` | Replace with plain `bg-surface-2` if it was a section accent, `bg-paper` if it was a page background, or remove entirely. |
| Hover overlay gradients (e.g. `bg-gradient-to-t from-black/60 to-transparent`) | Remove the entire overlay div. |

- [ ] **Step 3: Verify build**

Run: `npm run build`

Search again to confirm no `bg-gradient-` or `from-` (Tailwind from-color shorthand) classes remain in component JSX outside of intentional uses (none should remain; the design system has zero gradients).

- [ ] **Step 4: Save point**

Zero gradients in the codebase.

---

### Task 13: Remove decorative motion

**Files:** any of the 30 files containing motion patterns.

- [ ] **Step 1: Find all decorative motion**

Run from the project root:

```bash
grep -rE "hover:scale-|group-hover:scale-|animate-pulse|animate-bounce|animate-fade-in|transition-transform|transition-all duration" src --include="*.tsx" -n
```

- [ ] **Step 2: Apply rules per occurrence**

| Original pattern | Replacement |
|---|---|
| `hover:scale-[1.02]`, `hover:scale-105`, etc. on cards | Remove the class. |
| `group-hover:scale-110` on images | Remove. |
| `transition-all`, `transition-transform` paired with the above | Remove (no scale = no transition needed). |
| `animate-pulse` on buttons (the green flash on add-to-cart) | Remove. The cart-icon badge in Task 16 will pulse instead. |
| `animate-pulse` on **loading skeletons** | **KEEP.** Skeleton uses `animate-shimmer` from Task 5; `animate-pulse` on actual loading placeholders is acceptable. Verify each occurrence is on a loading state (an empty placeholder div) before keeping. |
| `animate-bounce` on success checkmarks | Remove. The Check icon stays static. |
| `animate-fade-in` on initial section reveal | Remove. Sections are visible immediately. |
| Hover backgrounds `hover:bg-accent/50` etc. | Replace with `hover:bg-surface-2`. |

- [ ] **Step 3: ClientReviews — turn off auto-scroll on mobile**

Open `src/components/ClientReviews.tsx`. Find the auto-scroll logic (the `setInterval` or `setTimeout` that advances the carousel every 4 seconds). Delete that effect entirely. The user swipes manually on mobile.

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Save point**

Hover-scale, animate-pulse on non-loading elements, animate-bounce, animate-fade-in, and the auto-scrolling reviews are all gone.

---

### Task 14: Remove icon-in-disc patterns

**Files:** any of the 30 files containing the pattern.

- [ ] **Step 1: Find all icon-in-disc occurrences**

Run from the project root:

```bash
grep -rE "bg-primary/10 .*rounded-full" src --include="*.tsx" -n
```

Also search for similar variants: `bg-accent/10 rounded-full`, `bg-mocha-soft rounded-full` (which is the new equivalent — keep deliberate uses but not as page chrome).

- [ ] **Step 2: Apply rules**

For each occurrence:

| Context | Replacement |
|---|---|
| Trust signals row on Index (4 icons in discs as decoration) | Remove the entire row — see Task 19. |
| Benefit cards on About / Contact / Discovery hero (icon disc + title + subtitle) | Remove the disc wrapper. The icon sits at native scale (24px or 32px) immediately to the left of the title. Use `text-mocha` for the icon color; no background. |
| Section header icons (e.g. Package icon on either side of "Boxe Discovery") | Remove the icons entirely. The heading carries the section's identity. |
| FAQ section header icons (Building2, Package, ShoppingCart) | Remove the disc; keep the icon at native scale next to the section title. Same as benefit cards. |
| Login lock icon | Keep as a single 32px icon centered above the title — no disc. |

The general rule: **the disc dies, the icon may stay if it's earning its place at native scale.**

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

The icon-in-disc compulsion is gone. Where icons remain, they're at native scale, communicating without decoration.

---

## SUB-PHASE D — Big rebuilds (Tasks 15–19)

---

### Task 15: CartSheet component

**Files:**
- Create: `src/components/CartSheet.tsx`
- Verify: `src/components/ui/sheet.tsx` exists (shadcn Sheet primitive — should already be present)

- [ ] **Step 1: Confirm shadcn Sheet is available**

Read `src/components/ui/sheet.tsx`. Confirm `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetTrigger`, `SheetClose` are exported.

- [ ] **Step 2: Create the cart sheet**

Create `src/components/CartSheet.tsx`:

```tsx
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/hooks/useCart";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
import { Minus, Plus, X } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;   // the trigger element (cart icon + count)
};

export function CartSheet({ children }: Props) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotalLei = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const goCheckout = () => navigate("/checkout");

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] flex flex-col p-0 bg-surface"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-h2 font-medium text-text-strong">
            Coșul tău
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-body text-text-muted text-center py-12">
              Coșul este gol.
            </p>
          ) : (
            items.map((item) => <CartLine key={item.id + (item.skuId ?? '')} item={item} onQty={updateQuantity} onRemove={removeItem} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-3">
            <div className="flex justify-between text-body">
              <span className="text-text-muted">Subtotal</span>
              <span className="text-text-strong">{subtotalLei.toFixed(2)} Lei</span>
            </div>
            <ShippingEstimateForCart />
            <SheetClose asChild>
              <Button variant="primary" size="lg" className="w-full" onClick={goCheckout}>
                Mergi la checkout
              </Button>
            </SheetClose>
            <Button variant="ghost" size="sm" className="w-full" onClick={clearCart}>
              Golește coșul
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (id: string, skuId: string | undefined, qty: number) => void;
  onRemove: (id: string, skuId?: string) => void;
}) {
  const dec = () => onQty(item.id, item.skuId, Math.max(1, item.quantity - 1));
  const inc = () => onQty(item.id, item.skuId, item.quantity + 1);

  return (
    <div className="flex gap-4">
      {item.image && (
        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-sm bg-surface-2" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-strong truncate">{item.name}</p>
        {item.brand && <p className="text-caption text-text-muted">{item.brand}</p>}
        {item.sizeLabel && <p className="text-caption text-text-muted">{item.sizeLabel}</p>}
        <div className="flex items-center gap-3 mt-2">
          <Button variant="ghost" size="icon" onClick={dec} aria-label="Scade cantitatea">
            <Minus />
          </Button>
          <span className="text-body min-w-[20px] text-center">{item.quantity}</span>
          <Button variant="ghost" size="icon" onClick={inc} aria-label="Crește cantitatea">
            <Plus />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id, item.skuId)}
          aria-label="Elimină din coș"
        >
          <X />
        </Button>
        <p className="text-body text-text-strong">
          {(item.price * item.quantity).toFixed(2)} Lei
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds. The CartSheet is built but not yet wired into the Header (Task 17).

- [ ] **Step 4: Save point**

The cart UI is now a proper side-sheet, ready to be wired in.

---

### Task 16: SearchOverlay component

**Files:**
- Create: `src/components/SearchOverlay.tsx`

- [ ] **Step 1: Create the overlay component**

Create `src/components/SearchOverlay.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchOverlay({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (open) {
      // Focus input on open
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = query.trim().length >= 2
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length === 0) return;
    onOpenChange(false);
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[600px] p-0 gap-0 bg-surface"
        // Override default centering with top alignment
      >
        <form onSubmit={submit} className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Search className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută parfumuri sau branduri…"
            className="flex-1 bg-transparent outline-none text-body text-text placeholder:text-text-faint"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text duration-instant ease-default"
            aria-label="Închide"
          >
            <X />
          </button>
        </form>

        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/product/${p.id}`);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-3 hover:bg-surface-2 text-left duration-instant ease-default"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-sm bg-surface-2 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-strong truncate">{p.name}</p>
                    <p className="text-caption text-text-muted">{p.brand}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <p className="text-body text-text-muted text-center py-12 px-6">
            Niciun rezultat pentru „{query}".
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Add the keyboard shortcut hook globally**

Open `src/App.tsx`. After the existing imports, add a small `useGlobalSearchShortcut` hook usage. First, add a state for the overlay open status. Since Header consumes the overlay too, **the cleanest place is inside Header** rather than App. We'll wire it up in Task 17.

For Task 16, no global wiring yet — the component is self-contained.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

SearchOverlay component built, ready for Header to use.

---

### Task 17: Header rebuild

**Files:**
- Modify: `src/components/Header.tsx`

This is the largest single rebuild in Phase 1. Replace the entire file.

- [ ] **Step 1: Read the current Header**

Read `src/components/Header.tsx`. Note the current imports — we'll preserve any non-cosmetic logic.

- [ ] **Step 2: Replace the file**

Replace `src/components/Header.tsx` entirely with:

```tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartSheet } from "@/components/CartSheet";
import { SearchOverlay } from "@/components/SearchOverlay";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/", label: "Acasă" },
  { to: "/shop", label: "Magazin" },
  { to: "/discovery-sets", label: "Seturi Discovery" },
  { to: "/about", label: "Despre" },
];

const Header = () => {
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sticky header border-bottom only after scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 bg-paper transition-colors duration-quick ease-default " +
        (scrolled ? "border-b border-border" : "border-b border-transparent")
      }
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-14 md:h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src="/logo.png"
            alt="modestshop"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-body text-text hover:text-mocha duration-instant ease-default"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default"
            aria-label="Căutare"
          >
            <Search />
          </button>

          <CartSheet>
            <button
              type="button"
              className="h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default relative"
              aria-label="Coș"
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-pill bg-mocha text-paper text-caption flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </CartSheet>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default"
                aria-label="Meniu"
              >
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-[360px] bg-surface p-6">
              <nav className="flex flex-col gap-4 pt-4">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-h2 font-medium text-text-strong"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  className="text-h2 font-medium text-text-strong"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/faq"
                  className="text-h2 font-medium text-text-strong"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Header;
```

Notes:
- The previous `#ededed` background and the always-on border are gone; the border appears only after 8px scroll.
- Cart icon shows count only — no preview.
- Search icon opens the overlay; ⌘K / Ctrl+K shortcut works globally.
- Mobile menu becomes a sheet, not an inline expand.
- 5 nav links plus Contact & FAQ (in mobile only). Desktop shows the 4 from the spec footer top row (Acasă/Magazin/Seturi/Despre).

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

The Header is the new chrome — paper background, scroll-aware border, command-palette search, sheet-based cart, sheet-based mobile menu.

---

### Task 18: Footer rebuild

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace the Footer**

Replace `src/components/Footer.tsx` entirely with:

```tsx
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/shop", label: "Magazin" },
  { to: "/about", label: "Despre" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-paper mt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-12 md:py-16">
          <Link to="/" className="text-h2 md:text-h1 md:text-h1-md font-medium text-text-strong tracking-[-0.02em]">
            modestshop
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-body text-text hover:text-mocha duration-instant ease-default"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <a
            href="https://instagram.com/modestshop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text hover:text-mocha duration-instant ease-default"
            aria-label="Instagram"
          >
            <Instagram />
          </a>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-6 border-t border-border">
          <p className="text-caption text-text-faint italic">Eleganta nu se striga.</p>
          <p className="text-caption text-text-faint">
            © 2026 modestshop ·{" "}
            <Link to="/privacy" className="hover:text-text duration-instant ease-default">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link to="/terms" className="hover:text-text duration-instant ease-default">
              Termeni
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Save point**

The Footer is two rows. The tagline finally appears on the site, where it belongs.

---

### Task 19: Trust signals row + homepage cleanup

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Remove the Trust Signals row**

In `src/pages/Index.tsx`, find the section that renders the four "100% Authenticity / Free Shipping / Expert Selection / Sample-to-Bottle" cards (look for `Trust Signals` comment, or the four `bg-primary/10 rounded-full` icon cards in a row near the bottom).

Delete the entire section.

- [ ] **Step 2: Confirm prior cleanups landed on this page**

`src/pages/Index.tsx` should already be free of:
- The brand-logo marquee (replaced by `<BrandWall />` in Task 8)
- Hover-scale on cards (Task 13)
- `animate-fade-in` (Task 13)
- Gradients on section backgrounds (Task 12)

If any remain, clean them up now before saving.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Save point**

Homepage shed its noisiest row and inherited every system-wide cleanup. Phase 2 will re-architect its section order; this task just stops it from shouting.

---

## SUB-PHASE E — Verification (Task 20)

---

### Task 20: Full verification + manual QA

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Manual QA**

Walk through each item with the dev server. Mark ✅/❌.

**Foundation:**
1. Page background is warm paper (`hsl(30 20% 99%)`), not pure white.
2. Body text is Inter Regular (400), readable, not the previous fragile `font-light`.
3. No Playfair Display anywhere — open browser devtools, inspect any heading, confirm `font-family` resolves to Inter.
4. Page-wide text selection works on mobile (try selecting a product name on a phone or with mobile emulator).

**Primitives:**
5. Buttons: primary is filled mocha with paper text, no shadow, no gradient. Hover smoothly shifts to `--mocha-hover`. No scale.
6. Inputs: bordered with `--border`, white surface, focus shows a 2px mocha outline (no glow).
7. Cards: borders only, no drop shadows.
8. Badges: outline or soft mocha. No purple-pink gradient anywhere.

**Component-level:**
9. Product cards (`/shop`, home carousels): no hover-zoom, no rating stars, no gradient overlays. Just image + brand + name + price.
10. PDP rating: shows `4.6 / 5 (38 recenzii)` as text.
11. PDP notes: three quiet rows ("Vârf", "Inimă", "Bază") with note text. No pyramid colors, no gradient cards.
12. PDP: no longevity / projection progress bars.
13. Discovery set cards: outline badges ("Personalizabil" / "Pre-asamblat"). No gradient pills.

**Global cleanup:**
14. No section has a `bg-gradient-*` background anywhere.
15. No card or image animates on hover (no `scale`).
16. No `animate-pulse` on success buttons or non-loading elements.
17. Brand wall on home: static grid, no scrolling animation.
18. ClientReviews on mobile: doesn't auto-advance — user must swipe.
19. No icon-in-disc on About / Contact / FAQ / Discovery / Index.

**Header / Footer / new components:**
20. Header: paper background, no border at top of page; scroll down 10px → 1px border appears.
21. Header: cart icon shows count only. Click → side-sheet slides in from right at 350ms.
22. CartSheet: full content (line items, qty controls, subtotal, shipping estimate, primary CTA). On mobile, it's full-viewport.
23. Header search icon: click → command-palette overlay opens, input focused. Type to see live results. Esc closes.
24. ⌘K / Ctrl+K from anywhere → search overlay opens.
25. Mobile menu (hamburger): full sheet with nav links.
26. Footer: top row has wordmark, 4 links, Instagram icon. Bottom row has the tagline ("Eleganta nu se striga.") and copyright + Privacy + Termeni.

**Functionality preservation (smoke test):**
27. Add a product to cart from a product card → cart count badge updates → CartSheet shows the item.
28. Increment qty in CartSheet → updates immediately.
29. Click "Mergi la checkout" → navigates to `/checkout`.
30. Place an order with country = MD → confirmation page renders with correct totals (no regression from Phase B+C).
31. Filter products on `/shop` → results update, URL state syncs.
32. Open FAQ accordion → still expands smoothly.

**Accessibility floor:**
33. Tab through Header → focus rings appear on each interactive element (visible 2px mocha outline).
34. With OS-level reduced motion enabled, no transitions persist beyond 100ms.

- [ ] **Step 4: Stop the dev server**

Ctrl-C the running `npm run dev`.

- [ ] **Step 5: Final save point**

Phase 1 complete. Site is measurably quieter. All 73 user-facing features still work. Page-level redesigns are deferred to Phase 2.

---

## Self-review notes (plan author)

- **Spec coverage:** Each spec section has implementation tasks. Type system → Task 1. Color system → Task 1. Spacing/grid/radii → Task 1. Motion → Task 1 (tokens) + Task 13 (cleanup). Primitives → Tasks 2–5. ProductCard → Task 6. Star rating → Task 7. CartSheet → Task 15. Header → Task 17. Footer → Task 18. Brand-logo marquee removal → Task 8. Notes pyramid → Task 9. Progress bars → Task 10. Discovery badges → Task 11. Gradients → Task 12. Hover-scales/animations → Task 13. Icon-in-disc → Task 14. Trust signals → Task 19. `select-none` removal → Task 1 Step 2. Tagline placement → Task 18 (Footer bottom row).
- **Placeholders:** None remaining. Each global cleanup task lists concrete patterns + replacement rules + a grep command.
- **Type/name consistency:** `BrandWall`, `CartSheet`, `SearchOverlay`, `Rating` — used verbatim across tasks. Tailwind tokens (`bg-paper`, `text-text-strong`, `text-mocha`, `text-h1`, `text-body`, `text-caption`, `duration-quick`, `duration-instant`, `ease-default`) used consistently in every code block.
- **Task ordering:** Foundation (1–5) is strict. Sub-phase B (6–11) is parallel-safe. Sub-phase C (12–14) must run after B (because B already removes patterns from a few specific files; C catches the rest). Sub-phase D (15–19) builds on prior work. Task 20 is final.
- **Approximate line numbers** in modify steps are locator hints only; the before-blocks in the file are the authoritative match target.
