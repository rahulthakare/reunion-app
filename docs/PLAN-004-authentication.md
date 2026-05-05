# PLAN-004 — Authentication (Admin Section Only)

> **Status:** ✅ Complete
> **Created:** 2026-05-03
> **Last Updated:** 2026-05-03
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Implement authentication that protects only the admin section of the Reunion App.
Public-facing pages (home, events listing) remain accessible to all visitors.
Only users with a document in the `admins` Firestore collection can access routes
under `/admin`. Authentication uses Firebase Auth (email/password + Google OAuth)
with an httpOnly session cookie for secure server-side validation.

---

## 2. Scope Boundaries

### In Scope
- Login page (`/login`) with email/password and Google OAuth
- `AuthContext` and `AuthProvider` for client-side auth state
- Next.js `middleware.ts` for edge-level route protection
- Server-side session cookie via `/api/auth/session` API route
- Admin layout (`src/app/(admin)/layout.tsx`) with server-side session verification
- Admin dashboard page (`/admin`)
- `AdminNav` component with sign-out functionality
- `admins` Firestore collection as the role-check mechanism

### Out of Scope
- User self-registration (admin users are manually provisioned)
- Password reset flow (future plan)
- Multi-factor authentication (future plan)
- Role-based access within the admin section (future plan)
- Public user authentication (future plan)

---

## 3. Hard Constraints

- [ ] Admin routes must be protected both at the middleware level AND in the server layout
- [ ] Session cookie must be `httpOnly` — never readable by client JavaScript
- [ ] Firebase Admin SDK must only be used in server-side code (API routes, server layouts)
- [ ] `isAdmin` check must read from Firestore `admins` collection, not just auth state
- [ ] No `any` types in TypeScript

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firebase Auth (client SDK v10) | External | Google | `signInWithEmailAndPassword`, `signInWithPopup` |
| Firebase Auth (Admin SDK v12) | External | Google | `verifySessionCookie`, `createSessionCookie` |
| `admins/{uid}` Firestore collection | Internal | This project | Presence = admin role |
| `/api/auth/session` POST/DELETE | Internal API | This project | Creates/destroys session cookie |
| `session` cookie | Internal | This project | httpOnly, secure in prod, 5-day expiry |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase client SDK |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase client SDK |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin SDK |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin SDK |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Controls `secure` flag on session cookie |

### Source
Firebase Console → Project Settings and Service Accounts. See `.env.local.example`.

### Fallback Behavior
- Missing client SDK vars → Firebase fails to initialise; login page errors.
- Missing Admin SDK vars → `/api/auth/session` fails; session cannot be created.

### Secret Handling
- `FIREBASE_ADMIN_PRIVATE_KEY` is server-only, stored in `.env.local`, never logged.
- Session cookie is `httpOnly` — not accessible via `document.cookie`.

---

## 6. Missing Details / Open Questions

- [ ] Should there be a "Forgot password" flow? (deferred to future plan)
- [ ] Should admin users be provisioned via a UI or always manually via Firestore? (currently manual)
- [ ] Session duration: currently 5 days — is this acceptable?

---

## 7. Assumptions

- Admin users are manually provisioned in Firestore (no self-registration).
- The `admins` collection is the single source of truth for admin role.
- Firebase project is live (PLAN-002 is complete) before this plan is tested end-to-end.
- Google OAuth is enabled in the Firebase Console.

---

## 8. Stop and Clarify If

- If the admin provisioning process needs to be automated, stop and design a separate admin creation flow.
- If session duration requirements differ from 5 days, confirm before deploying.

---

## 9. Progress

- [x] Create `src/types/user.ts` (AppUser interface)
- [x] Create `src/context/AuthContext.tsx` (AuthProvider + useAuth hook)
- [x] Create `src/middleware.ts` (edge route protection)
- [x] Create `src/app/api/auth/session/route.ts` (POST: create, DELETE: destroy)
- [x] Create `src/app/(auth)/layout.tsx`
- [x] Create `src/app/(auth)/login/page.tsx`
- [x] Create `src/app/(admin)/layout.tsx` (server-side session guard)
- [x] Create `src/app/(admin)/admin/page.tsx` (admin dashboard)
- [x] Create `src/components/features/AdminNav.tsx`
- [x] Update `src/app/layout.tsx` to wrap children with `AuthProvider`

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|
| 2026-05-03 | Next.js middleware runs at the Edge — Firebase Admin SDK cannot run there | Must use cookie-based check in middleware, Admin SDK only in server layouts/API routes | Used cookie presence check in middleware; full verification in admin layout |

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-03 | httpOnly session cookie (not JWT in localStorage) | localStorage token, client-side only auth | httpOnly cookie is XSS-resistant; enables server-side auth checks in Server Components |
| 2026-05-03 | Double guard: middleware + server layout | Middleware only | Middleware uses cookie presence (fast); server layout does full cryptographic verification (secure) |
| 2026-05-03 | `admins` Firestore collection for role check | Firebase Custom Claims | Easier to manage without Admin SDK claim-setting endpoint; visible in console |
| 2026-05-03 | Auth only for `/admin` routes | Auth for all routes | Public reunion pages should be freely accessible |

---

## 12. Outcomes & Retrospective

**What was delivered:**
- Fully functional login page (email + Google)
- Secure httpOnly session cookie flow
- Double-layer admin route protection (middleware + server layout)
- Admin dashboard with nav and logout
- AuthContext available to all client components

**What went well:**
- Clean separation between public, auth, and admin route groups
- Server Components used for auth verification (no client JS needed)

**What could be improved:**
- Password reset flow is missing — should be PLAN-005
- Admin provisioning UI would be useful at scale

**Follow-up plans needed:**
- PLAN-005: Password reset flow
- PLAN-006: Events management (CRUD)

---

## 13. Context and Orientation

- Requires: PLAN-001 (scaffold), PLAN-002 (Firebase), PLAN-003 (Tailwind)
- See `ARCHITECTURE.md` §3 (Authentication Flow) and §6 (Security Model)
- See `AGENT.md` for env var conventions and "Do Not" rules

---

## 14. Interfaces and Dependencies

### Inputs
- Firebase project live with Auth and Firestore enabled (PLAN-002)
- `admins` Firestore collection with at least one admin user document
- `.env.local` populated with Firebase credentials

### Outputs
- `src/context/AuthContext.tsx` — auth state provider
- `src/middleware.ts` — edge route guard
- `src/app/api/auth/session/route.ts` — session API
- `src/app/(auth)/login/page.tsx` — login UI
- `src/app/(admin)/layout.tsx` — admin layout with server-side guard
- `src/app/(admin)/admin/page.tsx` — admin dashboard
- `src/components/features/AdminNav.tsx` — admin navigation

### Internal Dependencies
- `src/lib/firebase/client.ts` — client auth operations
- `src/lib/firebase/admin.ts` — server session verification
- `src/types/user.ts` — AppUser type

---

## 15. Identity / Data Semantics

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `AppUser` | `uid`, `email`, `displayName`, `photoURL`, `isAdmin` | Client-side auth state |
| `admins/{uid}` | `email`, `createdAt` | Firestore; presence = admin role |
| `session` cookie | Firebase session cookie string | httpOnly; 5-day expiry |

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Types, context, Firebase lib files | Small |
| Phase 2 | Middleware and session API route | Small |
| Phase 3 | Login page UI | Small |
| Phase 4 | Admin layout and dashboard | Small |
| Phase 5 | AdminNav with logout | Small |

---

## 17. Deliverables

- [x] `src/types/user.ts`
- [x] `src/context/AuthContext.tsx`
- [x] `src/middleware.ts`
- [x] `src/app/api/auth/session/route.ts`
- [x] `src/app/(auth)/layout.tsx`
- [x] `src/app/(auth)/login/page.tsx`
- [x] `src/app/(admin)/layout.tsx`
- [x] `src/app/(admin)/admin/page.tsx`
- [x] `src/components/features/AdminNav.tsx`
- [x] Updated `src/app/layout.tsx` with `AuthProvider`

---

## 18. Concrete Steps

### Step 1 — Define AppUser type
**What:** Create `src/types/user.ts` with `AppUser` interface.
**Why:** Shared type used by AuthContext and components.
**Done when:** File exists with correct fields including `isAdmin`.

### Step 2 — Create AuthContext
**What:** Create `src/context/AuthContext.tsx` with `AuthProvider` and `useAuth` hook.
**Why:** Provides client-side auth state to all client components.
**Done when:** Provider wraps root layout; `useAuth()` returns user, loading, and auth methods.

### Step 3 — Create Middleware
**What:** Create `src/middleware.ts` to guard `/admin` routes and redirect from `/login` when authenticated.
**Why:** Fast edge-level protection before any page renders.
**Done when:** Unauthenticated requests to `/admin` redirect to `/login`.

### Step 4 — Create Session API Route
**What:** Create `POST /api/auth/session` and `DELETE /api/auth/session`.
**Why:** Converts Firebase ID token to httpOnly session cookie; clears it on logout.
**Done when:** POST sets cookie; DELETE clears cookie.

### Step 5 — Create Login Page
**What:** Create `src/app/(auth)/login/page.tsx` with email/password form and Google button.
**Why:** Entry point for admin authentication.
**Done when:** Both sign-in methods work; session cookie is set; user is redirected to `/admin`.

### Step 6 — Create Admin Layout with Server Guard
**What:** Create `src/app/(admin)/layout.tsx` that verifies session cookie using Firebase Admin SDK.
**Why:** Cryptographically verifies the session on every admin page load.
**Done when:** Invalid/missing session redirects to `/login`; valid session renders admin UI.

### Step 7 — Create Admin Dashboard and Nav
**What:** Create `src/app/(admin)/admin/page.tsx` and `src/components/features/AdminNav.tsx`.
**Why:** Provides the admin landing page and navigation with logout.
**Done when:** Dashboard renders; logout clears cookie and redirects to `/login`.

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
- [ ] `/login` loads without errors
- [ ] Valid admin credentials → redirected to `/admin`
- [ ] Invalid credentials → error message shown
- [ ] `/admin` without session → redirected to `/login`
- [ ] `/admin` with valid session → dashboard renders
- [ ] Logout → session cleared → redirected to `/login`
- [ ] `/` (home page) is accessible without authentication
- [ ] Google sign-in flow works end-to-end

---

## 20. Non-Goals / Regression Guards

- Must not add authentication to public routes (`/`, future `/events`)
- Must not store session token in localStorage or sessionStorage
- Must not use Firebase Custom Claims (use `admins` collection instead)
- Must not break the root layout or existing pages

---

## 21. Idempotence and Recovery

- **Idempotent?** Yes — all files can be recreated; session cookie is stateless.
- **Recovery:** If session is corrupt, clear cookies in browser; user must log in again.
- **Rollback:** Remove `(admin)` and `(auth)` route groups; remove middleware.

---

## 22. Artifacts and Notes

- [Firebase Session Cookies](https://firebase.google.com/docs/auth/admin/manage-sessions)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Firebase Auth — signInWithPopup](https://firebase.google.com/docs/auth/web/google-signin)

---

## 23. Review Checklist

- [x] All **Deliverables** exist and are correct
- [x] All **Concrete Steps** are marked done in **Progress**
- [x] **Decision Log** is up to date
- [x] **Outcomes & Retrospective** is filled in
- [ ] **Standard Post-Implementation Checklist** passes (requires Firebase project)
- [ ] **Plan-Specific Acceptance Criteria** all pass (requires Firebase project)
- [x] No regressions — public routes unaffected
- [x] `PLANS.md` index updated to ✅ Complete
