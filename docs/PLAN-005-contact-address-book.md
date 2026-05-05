# PLAN-005 — Contact / Address Book

> **Status:** ✅ Complete
> **Created:** 2026-05-04
> **Last Updated:** 2026-05-04
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Create a searchable, sortable, paginated **Contact / Address Book** section for the
NEHS Wardha — Batch '93 reunion app. This allows all batchmates to find and reconnect
with each other by browsing or searching the directory of registered students.

The directory is publicly visible (no login required) but contact details (phone/email)
are only shown to logged-in users or optionally hidden per student's preference.
Admins can add, edit, and delete contacts via the admin section.

---

## 2. Scope Boundaries

### In Scope
- **Public directory page** (`/directory`) — card/list view of all batchmates
- **Search** — live search by name, city, or profession
- **Sorting** — by name (A–Z, Z–A), city, recently added
- **Pagination** — client-side pagination (e.g. 12 or 24 per page)
- **Contact card** — photo (avatar/initials fallback), name, city, profession, optional social link
- **Contact detail** — phone/email visible only to authenticated users (or hidden if opted out)
- **Admin: Add/Edit/Delete contact** (`/admin/directory`)
- **Admin: Bulk import** via CSV (optional stretch goal)
- Firestore `contacts` collection as the data store

### Out of Scope
- Self-registration by batchmates (contacts are admin-managed)
- Private messaging between batchmates
- Social network features (follow, friend request)
- Export to vCard / CSV (future plan)
- Mobile app

---

## 3. Hard Constraints

- [ ] Phone numbers and email addresses must NOT be visible to unauthenticated users
- [ ] All Firestore reads for the public directory must only return non-sensitive fields
- [ ] Admin write operations must verify session cookie server-side (Firebase Admin SDK)
- [ ] Search must work client-side (no full-text search engine required at this scale)
- [ ] Must maintain TypeScript strict mode — no `any`
- [ ] Must be mobile-responsive

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firestore `contacts` collection | Internal | This project | See §15 for schema |
| `/api/contacts` GET/POST/PUT/DELETE | Internal API | This project | See §18 |
| Firebase Auth session cookie | Internal | This project | For gating sensitive fields |
| Firebase Storage | External | Google | Optional: for contact profile photos |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|
| All Firebase vars from PLAN-002 | Required for Firestore reads/writes |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CONTACTS_PAGE_SIZE` | `24` | Number of contacts per page |

### Source
Same as PLAN-002 — Firebase Console credentials in `.env.local`.

### Fallback Behavior
- If Firestore is unreachable, show a friendly error state on the directory page.
- If a contact has no photo, show a coloured avatar with initials.

### Secret Handling
- Phone/email fields are filtered out server-side for unauthenticated requests.
- No new secrets introduced beyond existing Firebase credentials.

---

## 6. Missing Details / Open Questions

- [ ] Should batchmates be able to opt out of showing their contact details? (privacy toggle per contact)
- [x] ~~Should the directory be fully public, or require login to view even names?~~ → Resolved: **Full auth gate — login required to view any contacts**
- [ ] Should admins be able to bulk-import contacts from a CSV? (stretch goal)
- [x] ~~Is a profile photo upload required, or initials-based avatar sufficient for v1?~~ → Resolved: **Initials avatar only in v1**
- [x] ~~Should there be a "Claim your profile" flow?~~ → Resolved: **Deferred to PLAN-006**
- [ ] What fields are mandatory vs optional for a contact?

---

## 7. Assumptions

- Contacts are managed by admins only (no self-registration in this plan).
- The `contacts` Firestore collection will have ~100–200 entries (class of 1993).
- Client-side search and pagination is sufficient at this scale (no Algolia/Elasticsearch needed).
- Profile photos are optional in v1 — initials avatar is the fallback.
- Phone and email are sensitive and gated behind authentication.

---

## 8. Stop and Clarify If

- If the privacy model changes (e.g. fully private directory), stop and redesign the API response filtering.
- If bulk CSV import is required as part of v1 (not a stretch goal), stop and add a dedicated import step.
- If profile photo upload is required in v1, stop and confirm Firebase Storage is enabled (PLAN-002).
- If "claim your profile" self-edit is required, stop — this needs its own plan (PLAN-006).

---

## 9. Progress

- [ ] Create `src/types/contact.ts`
- [ ] Create Firestore Security Rules for `contacts` collection
- [ ] Create `src/app/api/contacts/route.ts` (GET list, POST create)
- [ ] Create `src/app/api/contacts/[id]/route.ts` (GET one, PUT update, DELETE)
- [ ] Create `src/components/ui/ContactCard.tsx`
- [ ] Create `src/components/ui/ContactGrid.tsx` (search + sort + pagination)
- [ ] Create `src/app/(main)/directory/page.tsx` (public directory page)
- [ ] Create `src/app/(admin)/admin/directory/page.tsx` (admin list view)
- [ ] Create `src/app/(admin)/admin/directory/new/page.tsx` (add contact form)
- [ ] Create `src/app/(admin)/admin/directory/[id]/edit/page.tsx` (edit contact form)
- [ ] Add "Directory" link to public nav and admin nav
- [ ] Update Firestore Security Rules
- [ ] Seed a few sample contacts for testing
- [ ] Update `PLANS.md` index

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-04 | Client-side search + pagination | Server-side search, Algolia | ~200 contacts fits comfortably in memory; avoids extra infra cost |
| 2026-05-04 | Full auth gate on directory | Names-public with contact gating | Batchmate privacy — only logged-in batchmates can see the directory |
| 2026-05-04 | Admin-managed contacts in v1 | Self-registration | Simpler and faster to ship; self-edit can be PLAN-006 |
| 2026-05-04 | Initials avatar fallback | Require photo upload | Reduces friction for adding contacts; photos optional |

---

## 12. Outcomes & Retrospective

_To be filled in after completion._

---

## 13. Context and Orientation

- Requires: PLAN-001 (scaffold), PLAN-002 (Firebase), PLAN-003 (Tailwind), PLAN-004 (Auth)
- See `ARCHITECTURE.md` §4 for directory structure conventions
- See `AGENT.md` for TypeScript and route conventions
- Public route: `/directory` (no auth needed for names/city/profession)
- Admin routes: `/admin/directory`, `/admin/directory/new`, `/admin/directory/[id]/edit`

---

## 14. Interfaces and Dependencies

### Inputs
- Firebase project with Firestore enabled (PLAN-002)
- Auth session cookie (PLAN-004) — for gating sensitive fields
- Tailwind CSS (PLAN-003) — for styling

### Outputs
- `src/types/contact.ts`
- `src/app/api/contacts/route.ts`
- `src/app/api/contacts/[id]/route.ts`
- `src/components/ui/ContactCard.tsx`
- `src/components/ui/ContactGrid.tsx`
- `src/app/(main)/directory/page.tsx`
- `src/app/(admin)/admin/directory/` (list, new, edit pages)

### Internal Dependencies
- `src/lib/firebase/admin.ts` — server-side Firestore writes and session verification
- `src/lib/firebase/client.ts` — optional real-time updates
- `src/middleware.ts` — admin route protection (already handles `/admin/*`)

---

## 15. Identity / Data Semantics

### `contacts/{id}` Firestore Document

| Field | Type | Required | Sensitive | Description |
|-------|------|----------|-----------|-------------|
| `id` | string | auto | No | Firestore document ID |
| `name` | string | ✅ | No | Full name |
| `city` | string | ✅ | No | Current city of residence |
| `profession` | string | No | No | Job title / profession |
| `company` | string | No | No | Employer / company |
| `phone` | string | No | ✅ | WhatsApp / mobile (hidden from public) |
| `email` | string | No | ✅ | Email address (hidden from public) |
| `photoURL` | string | No | No | Firebase Storage URL or external URL |
| `socialLink` | string | No | No | LinkedIn / Facebook URL |
| `showContact` | boolean | No | No | Opt-in to show phone/email (default: true) |
| `createdAt` | string | auto | No | ISO timestamp |
| `updatedAt` | string | auto | No | ISO timestamp |

### Public vs Private fields
- **Public API** (`GET /api/contacts` — no session): returns `id`, `name`, `city`, `profession`, `company`, `photoURL`, `socialLink`
- **Authenticated API** (`GET /api/contacts` — with session): additionally returns `phone`, `email` (if `showContact: true`)

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Types + API routes (GET, POST, PUT, DELETE) | Medium |
| Phase 2 | ContactCard + ContactGrid components (search, sort, pagination) | Medium |
| Phase 3 | Public directory page (`/directory`) | Small |
| Phase 4 | Admin directory pages (list, add, edit) | Medium |
| Phase 5 | Nav updates + Firestore rules + testing | Small |

---

## 17. Deliverables

- [ ] `src/types/contact.ts` — Contact type definition
- [ ] `src/app/api/contacts/route.ts` — GET (list) + POST (create, admin only)
- [ ] `src/app/api/contacts/[id]/route.ts` — GET (one) + PUT (update) + DELETE (admin only)
- [ ] `src/components/ui/ContactCard.tsx` — individual contact card with avatar
- [ ] `src/components/ui/ContactGrid.tsx` — search bar + sort dropdown + grid + pagination
- [ ] `src/app/(main)/directory/page.tsx` — public directory page (Server Component)
- [ ] `src/app/(main)/layout.tsx` — public layout with nav (if not exists)
- [ ] `src/app/(admin)/admin/directory/page.tsx` — admin contact list
- [ ] `src/app/(admin)/admin/directory/new/page.tsx` — add contact form
- [ ] `src/app/(admin)/admin/directory/[id]/edit/page.tsx` — edit contact form
- [ ] Updated `src/components/features/AdminNav.tsx` — Directory link added
- [ ] Updated Firestore Security Rules — `contacts` collection rules

---

## 18. Concrete Steps

### Step 1 — Define Contact type
**What:** Create `src/types/contact.ts` with `Contact` and `PublicContact` interfaces.
**Why:** Shared types used by API routes, components, and admin forms.
**Done when:** File exists; `PublicContact` omits sensitive fields (`phone`, `email`).

### Step 2 — Create API routes
**What:** Create `GET /api/contacts` (list, filters sensitive fields by auth), `POST /api/contacts` (admin only), `GET /api/contacts/[id]`, `PUT /api/contacts/[id]` (admin only), `DELETE /api/contacts/[id]` (admin only).
**Why:** All Firestore operations go through server-side API routes to enforce auth and field filtering.
**Done when:** All 5 endpoints respond correctly; unauthenticated GET omits phone/email.

### Step 3 — Create ContactCard component
**What:** Create `src/components/ui/ContactCard.tsx` — shows avatar (photo or coloured initials), name, city, profession, social link. Phone/email shown if passed in.
**Why:** Reusable card used in both public directory and admin list.
**Done when:** Card renders correctly with and without photo; initials avatar uses consistent colour based on name.

### Step 4 — Create ContactGrid component
**What:** Create `src/components/ui/ContactGrid.tsx` — accepts contacts array, provides search input (filters by name/city/profession), sort dropdown (Name A–Z, Name Z–A, City, Recently Added), and pagination controls.
**Why:** Encapsulates all interactivity; keeps directory page simple.
**Done when:** Search filters in real-time; sort changes order; pagination shows correct page.

### Step 5 — Create public directory page
**What:** Create `src/app/(main)/directory/page.tsx` — Server Component that fetches all public contacts from `/api/contacts` and renders `<ContactGrid />`.
**Why:** Public-facing page; server-rendered for SEO and performance.
**Done when:** `/directory` loads and shows all contacts in a searchable, sortable, paginated grid.

### Step 6 — Create admin directory pages
**What:** Create admin list, add, and edit pages under `/admin/directory/`.
**Why:** Admins need to manage the contact database without touching Firestore directly.
**Done when:** Admin can add a new contact, edit an existing one, and delete a contact — all reflected immediately.

### Step 7 — Update navigation
**What:** Add "Directory" to the public nav (if exists) and `AdminNav`.
**Why:** Users and admins need to discover the feature.
**Done when:** Directory link visible in both navbars.

### Step 8 — Update Firestore Security Rules
**What:** Add rules for `contacts` collection: public read of non-sensitive fields, admin-only writes.
**Why:** Firestore rules are the last line of defence.
**Done when:** Unauthenticated clients can read contacts; only Admin SDK can write.

### Step 9 — Seed sample contacts
**What:** Add 3–5 sample contacts via the admin UI to verify the directory works end-to-end.
**Why:** Easier to test with real data than an empty collection.
**Done when:** Sample contacts appear in the public directory with correct field visibility.

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
- [ ] `/directory` loads and displays all contacts in a card grid
- [ ] Searching by name filters results in real-time
- [ ] Searching by city filters results in real-time
- [ ] Sorting by Name A–Z works correctly
- [ ] Sorting by Name Z–A works correctly
- [ ] Sorting by City works correctly
- [ ] Pagination shows correct number of contacts per page
- [ ] Pagination controls navigate between pages correctly
- [ ] Unauthenticated user does NOT see phone or email fields
- [ ] Authenticated user DOES see phone and email (if `showContact: true`)
- [ ] Contact with no photo shows initials avatar with consistent colour
- [ ] Admin can add a new contact at `/admin/directory/new`
- [ ] Admin can edit a contact at `/admin/directory/[id]/edit`
- [ ] Admin can delete a contact from `/admin/directory`
- [ ] Changes made by admin appear on the public directory page

---

## 20. Non-Goals / Regression Guards

- Must not break existing public pages (`/`, `/directory` is a new route)
- Must not break admin auth or existing admin pages
- Must not expose phone/email to unauthenticated users under any circumstance
- Must not add full-text search infrastructure (client-side search only)
- Must not allow non-admin users to write to `contacts` collection

---

## 21. Idempotence and Recovery

- **Idempotent?** Yes — API routes can be re-deployed; Firestore data persists independently.
- **Recovery:** If a contact is accidentally deleted, it must be re-added manually (no soft delete in v1).
- **Rollback:** Remove the `contacts` collection from Firestore; delete the route files.

---

## 22. Artifacts and Notes

- [Firestore Security Rules docs](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js dynamic routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Tailwind CSS grid](https://tailwindcss.com/docs/grid-template-columns)
- Colour avatar inspiration: use HSL colour derived from name string hash for consistent colours

### Sample Firestore Security Rules for `contacts`
```
match /contacts/{contactId} {
  // Public can read non-sensitive fields (enforced at API layer, not Firestore layer)
  allow read: if true;
  // Only Admin SDK (server-side) can write — client SDK writes are blocked
  allow write: if false;
}
```
> Note: Field-level filtering (hiding phone/email) is enforced in the API route, not Firestore rules, since Firestore doesn't support field-level security natively.

---

## 23. Review Checklist

- [ ] All **Deliverables** exist and are correct
- [ ] All **Concrete Steps** are marked done in **Progress**
- [ ] **Decision Log** is up to date
- [ ] **Outcomes & Retrospective** is filled in
- [ ] **Standard Post-Implementation Checklist** passes
- [ ] **Plan-Specific Acceptance Criteria** all pass
- [ ] No regressions in existing functionality
- [ ] `PLANS.md` index updated to ✅ Complete
