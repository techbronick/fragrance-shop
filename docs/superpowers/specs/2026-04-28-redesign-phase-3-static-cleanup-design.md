# Redesign Phase 3 — Static + Auth cleanup pass

**Date:** 2026-04-28
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 3 — third (and final) sub-project: **Static + Auth pages cleanup**
**Status:** spec

## Goal

Convert remaining Tailwind default text-size classes to Phase 2 named tokens across 8 static/auth pages. Minimal pass — no layout, structural, or font-weight changes.

## Decision captured

- **Approach C — minimal pass.** Strictly type-token conversion. Layout cleanup is deferred to a future pass if needed.

## Files affected

- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Careers.tsx`
- `src/pages/Login.tsx`
- `src/pages/NotFound.tsx`

## Token mapping

| Tailwind default | Replacement |
|---|---|
| `text-6xl`, `text-7xl` | `text-display md:text-display-md` |
| `text-4xl`, `text-5xl` | `text-h1 md:text-h1-md` |
| `text-3xl` | `text-h1` |
| `text-2xl` | `text-h2 md:text-h2-md` |
| `text-xl` | `text-h3 md:text-h3-md` |
| `text-lg` | `text-body-lg` |
| `text-base` | `text-body` |
| `text-sm` | `text-caption` (default) — keep `text-sm` only if the engineer judges it's an inline body-secondary that's clearly not a caption |
| `text-xs` | `text-caption` |

Responsive variants (`sm:text-3xl`, `md:text-4xl`, etc.) follow the same mapping. Often the responsive variant just disappears because the token's `md:` variant carries the desktop size already (e.g., `text-3xl md:text-4xl` → `text-h1 md:text-h1-md`).

## What's NOT changed

- `font-bold` / `font-medium` / `font-semibold` / `font-light` — leave alone
- Layout, container widths, section composition, `<Card>` wrappers
- Romanian copy
- Imports
- Component structure

## Verification

`npm run build` passes. Visually: text sizes shift slightly to spec values; structure unchanged.

## Out of scope / deferred

- Card → flat eyebrow section refactor (deferred to a future Phase 3+ pass if the visual still feels heavy)
- Font-weight cleanup
- Layout / hierarchy redesign per page
- Login screen redesign (currently a centered card with email/password — no design work needed for this pass)
- Any text content changes
