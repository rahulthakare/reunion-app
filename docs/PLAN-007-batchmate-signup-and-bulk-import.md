# PLAN-007 — Batchmate Sign-Up, Whitelist Auth & Bulk Contact Import

> **Status:** ✅ Complete
> **Created:** 2026-05-05
> **Last Updated:** 2026-05-05
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Open up the reunion app to all NEHS Wardha — Batch '93 batchmates by allowing them to
sign up and access the address book themselves, while preserving privacy through a
**whitelist authorization model**. Only emails the admin has pre-loaded into the
`contacts` collection (typically via CSV import) are allowed to log in. Anyone else
who tries to sign up lands in a `pending_approvals` queue for the admin to review.

Today, only admins can log in. After this plan, batchmates can self-onboard with
either email/password or Google sign-in, and the admin has tools to bulk-import
contacts from a CSV and approve unrecognized signups.

---

## 2. Scope Boundaries

### In Scope
- **CSV bulk-import script** (`scripts/import-contacts.ts`) — admin runs locally to seed Firestore
- **Whitelist enforcement** in `/api/auth/session` — block login if email not in `contacts`
- **Pending approvals queue** — `pending_approvals` Firestore collection
- **Login page redesign** — tabs for Sign In vs Create Account; both methods (email/password + Google)
- **Forgot password** link (Firebase built-in)
- **Admin Pending Approvals page** (`/admin/pending-approvals`)
  - List, Approve (auto-create contact with email + firstName + lastName from signup), Reject
- **Admin nav badge** showing pending approval count
- **Login page error handling** — clear "your email isn't on the list" message + pending approval flow

### Out of Scope
- Self-edit own profile / "Claim Your Profile" flow — deferred to PLAN-008
- Magic link sign-in (Firebase supports it, but skipping for v1 to keep simple)
- Email notifications when approved — manual admin notifies batchmate for now
- Bulk reject / bulk approve — one at a time in v1
- Audit log of who approved/rejected what
- Password complexity requirements beyond Firebase defaults
- Two-factor authentication

---

## 3. Hard Constraints

- [ ] Whitelist check must happen server-side (in API route) — never trust client
- [ ] Wrong-email signups must NOT be able to access `/directory` or any auth-gated page
- [ ] Admin SDK only on server, never client
- [ ] No `any` in TypeScript
- [ ] CSV import must NOT overwrite existing contacts — skip duplicates by email
- [ ] CSV import must be idempotent — re-running produces same result
- [ ] No secrets committed to version control

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firebase Auth (client SDK) | External | Google | createUserWithEmailAndPassword, sendPasswordResetEmail |
| Firebase Auth (Admin SDK) | External | Google | verifyIdToken, getUser |
| Firestore `contacts` | Internal | This project | Whitelist source — uses `email` field |
| Firestore `pending_approvals` | Internal (NEW) | This project | See §15 |
| `/api/auth/session` POST | Internal | This project | Updated to enforce whitelist |
| `/api/admin/pending-approvals` | Internal (NEW) | This project | GET (list), POST (approve), DELETE (reject) |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|
| All Firebase env vars from PLAN-002 | Required for Firestore + Auth |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `IMPORT_CSV_PATH` | none | Path to CSV file when running the import script (passed as CLI arg) |

### Source
Same as previous plans — `.env.local` for local, Vercel env vars for production.

### Fallback Behavior
- If `contacts` collection is empty → no one can log in (treat as locked-down state)
- Admin can always be added directly in Firebase Console → Firestore + add to `admins` collection

### Secret Handling
No new secrets. Service account JSON for the import script is read from existing
`FIREBASE_ADMIN_*` env vars in `.env.local`.

---

## 6. Missing Details / Open Questions

- [x] ~~Bulk import format?~~ → Resolved: CSV
- [x] ~~Wrong email handling?~~ → Resolved: Auto-create pending approval
- [x] ~~Approval auto-create behavior?~~ → Resolved: Option C — auto-create with email + firstName + lastName
- [ ] Should we email batchmates when their pending approval is approved? (Skipped for v1 — admin notifies via WhatsApp manually)
- [ ] Should we rate-limit signup attempts to prevent abuse? (Firebase has built-in protection)

---

## 7. Assumptions

- Admin will compile a CSV of batchmates (some with full info, some email-only).
- Most batchmates will use Google sign-in (no password to remember).
- ~150-200 batchmates total — small enough that manual approval is feasible.
- Email is the unique identifier — same email across Google account and email/password.

---

## 8. Stop and Clarify If

- If a batchmate uses different emails for Google vs email/password — they'll need separate approvals; clarify how to handle.
- If CSV has unusual columns or formats not anticipated, stop and inspect a sample.
- If admin wants email notifications on approval, stop and add email integration (separate plan).

---

## 9. Progress

- [x] Write this plan
- [ ] Step 1: Build CSV bulk-import script (`scripts/import-contacts.ts`)
- [ ] Step 2: Whitelist enforcement in `/api/auth/session`
- [ ] Step 3: Verify Google sign-in works with whitelist
- [ ] Step 4: Self sign-up tab on login page
- [ ] Step 5: Forgot password link
- [ ] Step 6: `/admin/pending-approvals` page
- [ ] Step 7: Update admin nav with Pending Approvals badge
- [ ] Step 8: Update PLANS.md index

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-05 | Whitelist by email in `contacts` | Custom Claims, separate `allowed_emails` collection | Reuses existing data; admin already adds contacts |
| 2026-05-05 | Pending approval queue (Option C) | Auto-reject, full admin form | Compromise: admin sees real signup, contact entry pre-populated |
| 2026-05-05 | Both email/password AND Google sign-in | Google only | Some batchmates may not have Gmail; flexibility wins |
| 2026-05-05 | Skip email notifications on approval | Send via Firebase Functions | YAGNI for v1; admin can notify via WhatsApp |
| 2026-05-05 | CSV import as a Node script (not admin UI) | Build admin UI for import | Faster to ship; CSV is one-time; admin can re-run |
| 2026-05-05 | Skip duplicates on import (by email) | Overwrite | Idempotent, safer; admin edits via UI for changes |

---

## 12. Outcomes & Retrospective

_To be filled in after completion._

---

## 13. Context and Orientation

- Builds on: PLAN-004 (Auth), PLAN-005 (Directory), PLAN-006 (Extended fields)
- See `ARCHITECTURE.md` §3 (auth flow) and §6 (security model)
- See `src/app/api/auth/session/route.ts` — to be updated
- See `src/app/(auth)/login/page.tsx` — to be updated

---

## 14. Interfaces and Dependencies

### Inputs
- Existing `contacts` Firestore collection (whitelist source)
- Firebase Auth (already configured)
- Admin SDK env vars (already configured)
- A CSV file containing batchmate emails (admin-supplied)

### Outputs
- Updated `/api/auth/session` with whitelist enforcement
- New `pending_approvals` Firestore collection
- New `/admin/pending-approvals` page
- New API routes:
  - `GET /api/admin/pending-approvals` — list
  - `POST /api/admin/pending-approvals/[uid]/approve`
  - `DELETE /api/admin/pending-approvals/[uid]`
- New `scripts/import-contacts.ts` script
- Updated login page with Sign In / Create Account tabs

### Internal Dependencies
- `src/lib/firebase/admin.ts`
- `src/types/contact.ts`
- New `src/types/pending-approval.ts`

---

## 15. Identity / Data Semantics

### `pending_approvals/{uid}` (NEW)

Document ID = Firebase Auth UID of the user who tried to sign up.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | ✅ | Firebase Auth UID (also doc ID) |
| `email` | string | ✅ | Email used during signup |
| `firstName` | string | optional | If entered during signup |
| `lastName` | string | optional | If entered during signup |
| `provider` | string | ✅ | "password" or "google.com" |
| `requestedAt` | string | ✅ | ISO timestamp |
| `notes` | string | optional | Optional message from user (future) |

### `contacts/{id}` — UNCHANGED schema

Whitelist check uses `email` field (already exists from PLAN-005/006).

### Approval flow
1. Admin clicks **Approve** on a pending approval
2. Server creates `contacts/{newId}` with `email` + `firstName` + `lastName` from pending doc
3. Server deletes the `pending_approvals/{uid}` doc
4. Next time the user tries to log in → whitelist check passes → success

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | CSV import script | Medium |
| Phase 2 | Whitelist enforcement + login page errors | Small |
| Phase 3 | Self sign-up flow + forgot password | Medium |
| Phase 4 | Pending approvals admin UI | Medium |
| Phase 5 | Nav update + plan index | Small |

---

## 17. Deliverables

- [ ] `scripts/import-contacts.ts`
- [ ] Updated `package.json` with `import-contacts` script
- [ ] Updated `src/app/api/auth/session/route.ts` with whitelist check
- [ ] Updated `src/app/(auth)/login/page.tsx` with tabs + sign up + forgot password
- [ ] New `src/types/pending-approval.ts`
- [ ] New `src/app/api/admin/pending-approvals/route.ts` (GET)
- [ ] New `src/app/api/admin/pending-approvals/[uid]/approve/route.ts` (POST)
- [ ] New `src/app/api/admin/pending-approvals/[uid]/route.ts` (DELETE)
- [ ] New `src/app/(admin)/admin/pending-approvals/page.tsx`
- [ ] Updated `src/components/features/AdminNav.tsx` with badge
- [ ] Updated `PLANS.md`

---

## 18. Concrete Steps

### Step 1 — CSV Bulk Import Script
**What:** Create `scripts/import-contacts.ts` that reads CSV, dedupes by email, writes to Firestore.
**Why:** Admin can seed the whitelist with all known batchmates in one shot.
**Done when:** Running `npm run import-contacts -- ./batchmates.csv` adds N contacts and reports skipped duplicates.

### Step 2 — Whitelist enforcement
**What:** Update `POST /api/auth/session` to look up email in `contacts.email` after Firebase token verification.
- If found → set session cookie, return `{ status: "ok" }`
- If not found → create `pending_approvals/{uid}`, return `{ status: "pending" }`, do NOT set session cookie
**Why:** Prevents non-batchmates from accessing the directory.
**Done when:** Login with a non-whitelisted email creates a pending entry; login with whitelisted email succeeds.

### Step 3 — Verify Google sign-in works with whitelist
**What:** Test the Google flow end-to-end. Verify the same `/api/auth/session` whitelist check applies.
**Why:** Ensure parity between sign-in methods.
**Done when:** Whitelisted Google account logs in; non-whitelisted Google account creates pending approval.

### Step 4 — Self sign-up tab on login page
**What:** Refactor `src/app/(auth)/login/page.tsx`:
- Toggle: "Sign In" | "Create Account"
- Create Account form: email, password, confirm password, first name, last name
- On submit: `createUserWithEmailAndPassword` → call `/api/auth/session` (which enforces whitelist)
- Show appropriate UI: success → redirect to /directory, pending → "Awaiting approval", error → friendly message
**Why:** Self-onboarding for batchmates without admin intervention.
**Done when:** A batchmate can complete signup and either log in or land in pending state.

### Step 5 — Forgot Password link
**What:** Add "Forgot password?" link → click → enter email → `sendPasswordResetEmail(auth, email)` → "Check your inbox" message.
**Why:** Lost passwords shouldn't require admin help.
**Done when:** Clicking link sends Firebase reset email and shows confirmation.

### Step 6 — Admin Pending Approvals page
**What:** Create `/admin/pending-approvals`:
- List of all `pending_approvals` docs (most recent first)
- Each row: email, name (if any), provider, requested date
- Approve button → `POST /api/admin/pending-approvals/[uid]/approve` → creates contact, deletes pending
- Reject button → `DELETE /api/admin/pending-approvals/[uid]` → deletes pending (Firebase Auth user remains; future signups would re-create pending)
**Why:** Admin reviews unrecognized signups.
**Done when:** Admin can list, approve (verifying contact appears), and reject pending requests.

### Step 7 — AdminNav badge
**What:** Add "Pending Approvals" link to AdminNav with red badge showing count if > 0.
**Why:** Admin notices new requests without polling.
**Done when:** Badge shows count; clicking goes to pending approvals page.

### Step 8 — Update PLANS.md
**What:** Add PLAN-007 to index, mark complete.
**Why:** Keep the index accurate.
**Done when:** PLAN-007 row in PLANS.md shows ✅ Complete.

---

## 19. Validation and Acceptance

### Standard Post-Implementation Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts and home loads
- [ ] No console errors
- [ ] No `any` types
- [ ] No secrets in code

### Plan-Specific Acceptance Criteria
- [ ] CSV import script runs and reports success/failure per row
- [ ] Re-running the same CSV doesn't create duplicates
- [ ] Empty CSV email → row skipped with warning
- [ ] Non-whitelisted email signup creates `pending_approvals` doc and shows "Awaiting approval" message
- [ ] Whitelisted email signup logs in successfully
- [ ] Google sign-in respects whitelist same as email/password
- [ ] Forgot password sends reset email
- [ ] Admin can see pending approvals at `/admin/pending-approvals`
- [ ] Approve creates a contact entry visible in `/admin/directory`
- [ ] Reject removes the pending entry
- [ ] AdminNav badge shows correct count

---

## 20. Non-Goals / Regression Guards

- Must not break existing admin login (admins log in via existing flow)
- Must not break public landing page or RSVP form
- Must not allow non-whitelisted users to access `/admin/*` or `/directory`
- Must not allow client-side bypass of whitelist
- Must not modify the existing Contact schema

---

## 21. Idempotence and Recovery

- **CSV import:** ✅ Idempotent — duplicates skipped
- **Whitelist check:** ✅ Idempotent — no state mutation
- **Approval:** ⚠️ Once approved, the pending doc is deleted; re-approval requires admin to re-add contact manually
- **Recovery:** Pending approvals are just Firestore docs — can be edited/restored via Firebase Console
- **Rollback:** Revert the changed files; existing data is preserved (whitelist check disabled means everyone with Firebase Auth can log in again)

---

## 22. Artifacts and Notes

- [Firebase Auth — createUserWithEmailAndPassword](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Auth — sendPasswordResetEmail](https://firebase.google.com/docs/reference/js/auth.md#sendpasswordresetemail)
- CSV parsing: `csv-parse` or built-in Node parsing
- Sample CSV format documented in script comments

---

## 23. Review Checklist

- [ ] All Deliverables exist
- [ ] All Concrete Steps marked done in Progress
- [ ] Decision Log up to date
- [ ] Outcomes & Retrospective filled
- [ ] Standard Post-Implementation Checklist passes
- [ ] Plan-Specific Acceptance Criteria pass
- [ ] No regressions
- [ ] PLANS.md updated to ✅ Complete
