# PLAN-003 — Tailwind CSS Integration

> **Status:** ✅ Complete
> **Created:** 2026-05-03
> **Last Updated:** 2026-05-03
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Add Tailwind CSS to the Reunion App as the primary styling solution. Tailwind provides
utility-first CSS that enables rapid, consistent UI development without custom CSS overhead.
This plan establishes the Tailwind configuration, PostCSS pipeline, and a set of reusable
component utility classes used throughout the app.

---

## 2. Scope Boundaries

### In Scope
- Installing `tailwindcss`, `postcss`, and `autoprefixer`
- Creating `tailwind.config.ts` with content paths
- Creating `postcss.config.mjs`
- Updating `globals.css` with `@tailwind` directives and reusable `@layer components`
- Defining base component utilities: `btn-primary`, `btn-secondary`, `input-field`, `card`

### Out of Scope
- Custom Tailwind plugins or third-party component libraries
- Dark mode implementation (can be added later)
- Animation utilities beyond Tailwind defaults

---

## 3. Hard Constraints

- [ ] Must not add any third-party UI component library (keep it pure Tailwind)
- [ ] Tailwind must scan all files under `src/` to avoid purging used classes
- [ ] Must maintain TypeScript config file format (`tailwind.config.ts`)

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Tailwind CSS v3 | External library | Tailwind Labs | Use v3.x (not v4 alpha) |
| PostCSS | Build tool | PostCSS team | Required by Tailwind |

---

## 5. Runtime Config Contract

### Required
_No runtime env vars required for Tailwind._

### Fallback Behavior
If PostCSS is misconfigured, Tailwind classes will not be processed and the UI will be unstyled.

### Secret Handling
N/A

---

## 6. Missing Details / Open Questions

- [ ] Should dark mode be enabled (`class` strategy)? (deferred)

---

## 7. Assumptions

- Tailwind v3 is used (not v4 alpha).
- `postcss.config.mjs` is the correct format for this Next.js version.

---

## 8. Stop and Clarify If

- If a specific UI component library (e.g., shadcn/ui, Radix) is requested, stop and confirm before adding dependencies.

---

## 9. Progress

- [x] Add `tailwindcss`, `postcss`, `autoprefixer` to `package.json` devDependencies
- [x] Create `tailwind.config.ts`
- [x] Create `postcss.config.mjs`
- [x] Update `src/app/globals.css` with Tailwind directives and component utilities

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|
| 2026-05-03 | `globals.css` already had `@tailwind` directives from scaffold | None | Updated in-place |

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-03 | Pure Tailwind, no component library | shadcn/ui, Chakra UI, MUI | Keeps dependencies minimal; component library can be added later if needed |
| 2026-05-03 | Define reusable classes in `@layer components` | Inline everywhere | Reduces repetition for common patterns (buttons, inputs, cards) |

---

## 12. Outcomes & Retrospective

**What was delivered:** Tailwind CSS fully integrated with a PostCSS pipeline and four reusable component classes.

**What went well:** Straightforward integration with no conflicts.

**What could be improved:** Dark mode support should be added when the design is finalised.

**Follow-up plans needed:** None — Tailwind is now available for all feature plans.

---

## 13. Context and Orientation

- Builds on: PLAN-001 (scaffold)
- Used by: all subsequent feature plans
- See `src/app/globals.css` for defined component utility classes

---

## 14. Interfaces and Dependencies

### Inputs
- Existing `src/app/globals.css`
- `package.json`

### Outputs
- `tailwind.config.ts`
- `postcss.config.mjs`
- Updated `globals.css` with Tailwind directives and component utilities

---

## 15. Identity / Data Semantics

N/A — styling only, no data entities.

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Install dependencies | Tiny |
| Phase 2 | Config files | Tiny |
| Phase 3 | Update globals.css | Tiny |

---

## 17. Deliverables

- [x] `tailwind.config.ts`
- [x] `postcss.config.mjs`
- [x] Updated `src/app/globals.css`
- [x] Updated `package.json` with Tailwind dependencies

---

## 18. Concrete Steps

### Step 1 — Install Dependencies
**What:** Add `tailwindcss`, `postcss`, `autoprefixer` to `devDependencies` in `package.json`.
**Why:** Required build-time dependencies for Tailwind.
**Done when:** `package.json` updated; `npm install` succeeds.

### Step 2 — Create tailwind.config.ts
**What:** Create config with `content` paths covering all `src/` files.
**Why:** Tells Tailwind which files to scan for class names (tree-shaking).
**Done when:** File exists with correct content paths.

### Step 3 — Create postcss.config.mjs
**What:** Create PostCSS config with `tailwindcss` and `autoprefixer` plugins.
**Why:** Next.js uses PostCSS to process CSS; Tailwind requires PostCSS.
**Done when:** File exists and Tailwind classes are processed correctly.

### Step 4 — Update globals.css
**What:** Add `@tailwind base/components/utilities` directives and `@layer components` with reusable classes.
**Why:** Activates Tailwind and provides consistent component primitives.
**Done when:** `btn-primary`, `btn-secondary`, `input-field`, `card` classes work in components.

---

## 19. Validation and Acceptance

### Standard Post-Implementation Checklist
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts and app loads at http://localhost:3000
- [ ] No console errors in the browser

### Plan-Specific Acceptance Criteria
- [x] `tailwind.config.ts` exists with correct content paths
- [x] `postcss.config.mjs` exists
- [x] `globals.css` contains `@tailwind` directives
- [ ] Running `npm run dev` shows styled UI (Tailwind classes applied)
- [ ] `btn-primary`, `btn-secondary`, `input-field`, `card` classes render correctly

---

## 20. Non-Goals / Regression Guards

- Must not change the Next.js App Router structure
- Must not introduce any JavaScript UI framework dependency

---

## 21. Idempotence and Recovery

- **Idempotent?** Yes — config files can be re-created without side effects.
- **Recovery:** Delete config files and recreate from this plan.

---

## 22. Artifacts and Notes

- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Tailwind with Next.js](https://tailwindcss.com/docs/guides/nextjs)

---

## 23. Review Checklist

- [x] All **Deliverables** exist and are correct
- [x] All **Concrete Steps** are marked done in **Progress**
- [x] **Decision Log** is up to date
- [x] **Outcomes & Retrospective** is filled in
- [ ] **Standard Post-Implementation Checklist** passes (pending `npm install`)
- [ ] **Plan-Specific Acceptance Criteria** — runtime checks pending
- [x] `PLANS.md` index updated to ✅ Complete
