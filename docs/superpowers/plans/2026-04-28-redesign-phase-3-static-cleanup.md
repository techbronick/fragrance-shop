# Redesign Phase 3 — Static + Auth cleanup pass

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Tailwind default text-size classes to Phase 2 named tokens across 8 static/auth pages. Strictly type-token replacement. No layout, structural, or font-weight changes.

**Architecture:** One sweep task across 8 files using a deterministic mapping. No new files, no deletions, no refactors.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind. Phase 1 design tokens are the substrate.

**Spec:** `docs/superpowers/specs/2026-04-28-redesign-phase-3-static-cleanup-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits.

---

## Task 1: Token sweep across 8 static/auth pages

**Files:**
- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Careers.tsx`
- `src/pages/Login.tsx`
- `src/pages/NotFound.tsx`

For each file, apply this exact token mapping. Do NOT touch `font-bold` / `font-medium` / `font-semibold` / `font-light` — those are out of scope.

### Token mapping (apply mechanically per occurrence)

| Find | Replace with |
|---|---|
| `text-7xl` | `text-display md:text-display-md` |
| `text-6xl` | `text-display md:text-display-md` |
| `text-5xl` | `text-h1 md:text-h1-md` |
| `text-4xl` | `text-h1 md:text-h1-md` |
| `text-3xl` | `text-h1` |
| `text-2xl` | `text-h2 md:text-h2-md` |
| `text-xl` | `text-h3 md:text-h3-md` |
| `text-lg` | `text-body-lg` |
| `text-base` | `text-body` |
| `text-sm` | `text-caption` |
| `text-xs` | `text-caption` |

### Responsive variant collapsing

Phase 2 type tokens already include their `md:` counterparts (e.g., `text-h1` → `28px` on mobile, and `text-h1-md` → `36px` on desktop). When the source uses a Tailwind responsive sequence, collapse to the token pair:

| Find | Replace with |
|---|---|
| `text-3xl md:text-4xl` | `text-h1 md:text-h1-md` |
| `text-3xl md:text-5xl` | `text-h1 md:text-h1-md` |
| `text-3xl md:text-6xl` | `text-h1 md:text-display-md` |
| `text-2xl md:text-3xl` | `text-h2 md:text-h1-md` |
| `text-2xl md:text-4xl` | `text-h2 md:text-h1-md` |
| `text-xl md:text-2xl` | `text-h3 md:text-h2-md` |
| `text-lg md:text-xl` | `text-body-lg md:text-h3-md` |
| `text-base md:text-lg` | `text-body md:text-body-lg` |
| `text-sm md:text-base` | `text-caption md:text-body` |
| Any `sm:text-*` variant | Apply the table mapping to the bare class; leave `sm:text-*` as-is unless it duplicates the `md:` mapping |

For unusual combinations not in this table, apply the bare-class mapping for both halves and use judgment.

### Per-file approach

For EACH of the 8 files:

- [ ] **Step 1: Read the file**

Use the Read tool. Identify every `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-2xl`, `text-xl`, `text-lg`, `text-base`, `text-sm`, `text-xs` occurrence in JSX className strings.

- [ ] **Step 2: Apply replacements**

Use the Edit tool with `replace_all: true` per pattern, OR multiple Edit calls with surrounding context if the same class appears in different responsive combinations.

Example for a heading:

Find: `<h1 className="text-3xl md:text-4xl font-medium">`
Replace: `<h1 className="text-h1 md:text-h1-md font-medium">`

The `font-medium` part stays untouched.

- [ ] **Step 3: Verify file build (incremental)**

After each file's edits, run `npm run build` once at the end of the entire pass to verify (not after each file — the per-file changes are isolated and won't break each other).

### Edge cases to watch for

- If a class string uses `text-foreground` / `text-muted-foreground` (color, not size) — those are NOT in scope. Do not touch.
- If a class uses `text-center` / `text-left` / `text-right` (alignment) — also out of scope.
- Conditional className expressions (e.g., `text-3xl ${condition ? "md:text-4xl" : ""}`) — apply the mapping inside the strings; the conditional structure stays.
- Inline `style={{ fontSize: ... }}` — out of scope (no string class to replace).

### Final verification

- [ ] **Step 4: Run final build**

Run: `npm run build` from `/Users/bigjeery/Documents/wrk/fragrance-shop-main`
Expected: success.

- [ ] **Step 5: Re-grep for any leftover Tailwind default text sizes**

Run from project root:

```bash
grep -nE "text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)([^a-z-]|$)" src/pages/About.tsx src/pages/Contact.tsx src/pages/FAQ.tsx src/pages/Privacy.tsx src/pages/Terms.tsx src/pages/Careers.tsx src/pages/Login.tsx src/pages/NotFound.tsx
```

Expected: zero matches (or only `text-{color}` matches that aren't sizes).

If matches remain, apply the mapping to those.

- [ ] **Step 6: Save point**

Cleanup pass complete. The 8 static/auth pages now use Phase 2 named type tokens.

---

## Task 2: Final build verify

- [ ] **Step 1: Run final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Hand off to user**

User runs manual QA themselves; the pages should look very close to before, with type sizes shifted slightly to spec values (smaller-text-base became `text-body` 16px, larger headings collapse responsive variants into Phase 2's `-md` system).

---

## Self-review notes (plan author)

- **Spec coverage:** The mapping table in Task 1 covers all Tailwind default text-size classes per the spec. Edge cases for color/alignment/responsive combos called out.
- **Placeholders:** None.
- **Type consistency:** Tokens used (`text-display`, `text-h1`, `text-h1-md`, `text-h2`, `text-h2-md`, `text-h3`, `text-h3-md`, `text-body-lg`, `text-body`, `text-caption`) all defined in Phase 1 Tailwind config — verified.
- **No QA task** per user preference. Task 2 is build-verify only.
