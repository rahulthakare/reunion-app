# PLAN-001 — Project Scaffold & Harness Setup

> **Status:** ✅ Complete
> **Created:** 2026-05-03
> **Last Updated:** 2026-05-03
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Establish the foundational scaffold and developer harness for the Reunion App. This plan
covers the creation of the Next.js + TypeScript project structure, the core harness files
(AGENT.md, ARCHITECTURE.md, VERIFICATION.md, PLANS.md), and the `docs/` directory for
ongoing execution plans. Without this foundation, no feature work can begin in a
consistent, well-documented way.

---

## 2. Scope Boundaries

### In Scope
- Creating the `reunion-app/` directory
- Next.js 14+ project scaffold with TypeScript (strict mode)
- App Router directory structure (`src/app/`)
- Core harness files: `AGENT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `PLANS.md`
- `docs/` folder with this plan as the first entry
- Standard config files: `tsconfig.json`, `next.config.ts`, `.eslintrc.json`, `.gitignore`
- `README.md` with getting-started instructions

### Out of Scope
- Firebase project creation or configuration
- Any application features (auth, events, RSVP, photos)
- UI component library setup
- Deployment configuration
- Testing framework setup

---

## 3. Hard Constraints

- [ ] Must use Next.js App Router (not Pages Router)
- [ ] Must use TypeScript strict mode
- [ ] Must not include any Atlassian-specific packages
- [ ] Must not commit secrets or `.env.local`
- [ ] All harness files must be complete before feature work begins

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Next.js App Router API | External framework | Vercel | Use stable v14+ API |
| TypeScript strict config | Internal standard | This project | No `any`, no suppression |
| Node.js >= 18 | Runtime requirement | Developer environment | Required by Next.js 14 |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|
| None at this stage | No Firebase config needed for scaffold |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port for the dev server |

### Source
Not applicable for this plan — no external services are connected yet.

### Fallback Behavior
The app runs in scaffold mode with no Firebase connection. All Firebase integration
is deferred to a future plan.

### Secret Handling
No secrets are required for this plan. `.env.local` is gitignored but not yet needed.

---

## 6. Missing Details / Open Questions

- [x] ~~Which backend to use?~~ → Resolved: Firebase (Auth + Firestore + Storage)
- [x] ~~App Router vs Pages Router?~~ → Resolved: App Router
- [ ] What is the target deployment platform? (Vercel vs Firebase Hosting) — defer to deployment plan

---

## 7. Assumptions

- Developer has Node.js >= 18 installed locally.
- The project will use `npm` as the package manager.
- Firebase will be configured in a future plan (PLAN-002).
- Tailwind CSS will be added in a future plan if needed.

---

## 8. Stop and Clarify If

- If the user requests a specific folder structure that conflicts with App Router conventions, stop and clarify before proceeding.
- If a non-Firebase backend is preferred, stop before creating any Firebase-specific files.

---

## 9. Progress

- [x] Create `reunion-app/` directory
- [x] Create `package.json` with Next.js 14 + TypeScript dependencies
- [x] Create `tsconfig.json` with strict mode and path aliases
- [x] Create `next.config.ts`
- [x] Create `.eslintrc.json`
- [x] Create `.gitignore`
- [x] Create `src/app/layout.tsx`
- [x] Create `src/app/page.tsx`
- [x] Create `src/app/globals.css`
- [x] Create `src/app/error.tsx`
- [x] Create `src/app/loading.tsx`
- [x] Create `src/app/not-found.tsx`
- [x] Create `public/` directory
- [x] Create `README.md`
- [x] Create `AGENT.md`
- [x] Create `ARCHITECTURE.md`
- [x] Create `VERIFICATION.md`
- [x] Create `PLANS.md`
- [x] Create `docs/PLAN-001-project-scaffold.md` (this file)

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|
| 2026-05-03 | No existing Next.js scaffold in the workspace | Confirmed clean start | Created from scratch |

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-03 | Use Firebase as backend | Supabase, PocketBase, custom Node/Express | Firebase best fits rapid prototyping needs for a reunion app; Auth + Firestore + Storage all-in-one, real-time capable |
| 2026-05-03 | Use Next.js App Router | Pages Router | App Router is the current standard; Server Components reduce client JS bundle |
| 2026-05-03 | TypeScript strict mode | Loose TS | Prevents bugs early; required for long-term maintainability |

---

## 12. Outcomes & Retrospective

**What was delivered:**
A complete Next.js 14 + TypeScript project scaffold with App Router, all harness
documentation files, and the `docs/` execution plan directory.

**What went well:**
Clean starting point with no legacy constraints. All files created in a consistent structure.

**What could be improved:**
Tailwind CSS directives are in `globals.css` but the Tailwind package is not yet installed —
this should be addressed in the next plan if Tailwind is confirmed as the styling choice.

**Follow-up plans needed:**
- PLAN-002: Firebase setup (project config, Auth, Firestore, Security Rules)
- PLAN-003: Tailwind CSS integration (if confirmed)
- PLAN-004: Authentication UI (login, register pages)

---

## 13. Context and Orientation

- See `ARCHITECTURE.md` for the full system diagram and layer breakdown.
- See `AGENT.md` for conventions, constraints, and directory structure.
- See `VERIFICATION.md` for how to verify the scaffold is working.
- This is the first plan — all subsequent plans build on this foundation.

---

## 14. Interfaces and Dependencies

### Inputs
- Node.js >= 18 installed on the developer's machine
- npm available

### Outputs
- `reunion-app/` directory with full Next.js scaffold
- `AGENT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `PLANS.md` harness files
- `docs/PLAN-001-project-scaffold.md` (this file)

### Internal Dependencies
- None (this is the first plan)

---

## 15. Identity / Data Semantics

No data entities are introduced in this plan. Data models (User, Event, RSVP) will be
defined in future plans.

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Create Next.js project structure | Small |
| Phase 2 | Create harness files | Small |
| Phase 3 | Create docs directory and this plan | Small |

---

## 17. Deliverables

- [x] `reunion-app/package.json`
- [x] `reunion-app/tsconfig.json`
- [x] `reunion-app/next.config.ts`
- [x] `reunion-app/.eslintrc.json`
- [x] `reunion-app/.gitignore`
- [x] `reunion-app/README.md`
- [x] `reunion-app/src/app/layout.tsx`
- [x] `reunion-app/src/app/page.tsx`
- [x] `reunion-app/src/app/globals.css`
- [x] `reunion-app/src/app/error.tsx`
- [x] `reunion-app/src/app/loading.tsx`
- [x] `reunion-app/src/app/not-found.tsx`
- [x] `reunion-app/public/`
- [x] `reunion-app/AGENT.md`
- [x] `reunion-app/ARCHITECTURE.md`
- [x] `reunion-app/VERIFICATION.md`
- [x] `reunion-app/PLANS.md`
- [x] `reunion-app/docs/PLAN-001-project-scaffold.md`

---

## 18. Concrete Steps

### Step 1 — Create Next.js project files
**What:** Create `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc.json`, `.gitignore`
**Why:** These are the minimum required configuration files for a Next.js TypeScript project
**Done when:** All files exist and contain valid configuration

### Step 2 — Create App Router structure
**What:** Create `src/app/layout.tsx`, `page.tsx`, `globals.css`, `error.tsx`, `loading.tsx`, `not-found.tsx`
**Why:** These are the core pages and layouts required by the Next.js App Router
**Done when:** All files exist with correct TypeScript types and Next.js conventions

### Step 3 — Create harness documentation
**What:** Create `AGENT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `PLANS.md`
**Why:** Establishes the developer/agent harness for all future work
**Done when:** All four files exist and contain complete, accurate content

### Step 4 — Create docs directory and this plan
**What:** Create `docs/` directory and `docs/PLAN-001-project-scaffold.md`
**Why:** Establishes the pattern for execution plans used by all future work
**Done when:** This file exists and is linked from `PLANS.md`

---

## 19. Validation and Acceptance

### Standard Post-Implementation Checklist
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts and app loads at http://localhost:3000
- [ ] No console errors in the browser
- [ ] All new code is fully typed (no `any`)
- [ ] No secrets committed to version control

### Plan-Specific Acceptance Criteria
- [x] `reunion-app/` directory exists with correct structure
- [x] All harness files (`AGENT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `PLANS.md`) exist and are complete
- [x] `docs/PLAN-001-project-scaffold.md` exists and is linked from `PLANS.md`
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the server at http://localhost:3000

---

## 20. Non-Goals / Regression Guards

- Must not create a `pages/` directory (Pages Router is not used)
- Must not add any Atlassian-specific packages
- Must not include Firebase SDK at this stage (deferred to PLAN-002)

---

## 21. Idempotence and Recovery

- **Idempotent?** Yes — all files can be re-created by overwriting; no side effects.
- **Recovery:** If any file is corrupted, delete and recreate from the template in `PLANS.md`.
- **Rollback:** Delete the `reunion-app/` directory and start over from this plan.

---

## 22. Artifacts and Notes

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig#strict)
- [Firebase overview](https://firebase.google.com/docs)

---

## 23. Review Checklist

- [x] All **Deliverables** exist and are correct
- [x] All **Concrete Steps** are marked done in **Progress**
- [x] **Decision Log** is up to date
- [x] **Outcomes & Retrospective** is filled in
- [ ] **Standard Post-Implementation Checklist** passes (pending `npm install`)
- [x] **Plan-Specific Acceptance Criteria** — file-level criteria pass
- [x] No regressions in existing functionality (clean start)
- [x] `PLANS.md` index updated to ✅ Complete
