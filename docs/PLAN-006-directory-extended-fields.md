# PLAN-006 — Directory: Extended Address Book Fields

> **Status:** ✅ Complete
> **Created:** 2026-05-04
> **Last Updated:** 2026-05-04
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Extend the existing batchmate directory (PLAN-005) to capture and display a richer
set of contact information typically found in a school address book. Specifically,
add **first name**, **last name**, **current address**, and **permanent address**
as first-class fields, alongside the existing phone, email, and profession.

This makes the directory a true address book — useful well beyond just the reunion
day — so batchmates can find each other's home towns, write to permanent addresses
(family homes), and address each other properly by first/last name.

---

## 2. Scope Boundaries

### In Scope
- Add fields to `Contact` type: `firstName`, `lastName`, `currentAddress`, `permanentAddress`
- Backward compatibility — existing entries with only `name` keep working
- Update Admin Add/Edit form to collect new fields
- Update ContactCard to display new fields (with sensible truncation)
- Update Admin list view (table) to surface the new structure
- Extend search to also match across first/last name and addresses
- Migration helper — auto-derive `firstName`/`lastName` from existing `name` field on read
- Update PLAN-005 progress to note this extension

### Out of Scope
- Bulk CSV import of existing data (separate plan if needed)
- Address validation / autocomplete (e.g., Google Places API)
- Map integration / geocoding
- Splitting addresses into structured sub-fields (street/city/state/pincode) — kept as plain text per simplicity decision
- Self-edit by batchmates (still admin-only — that's PLAN-007)

---

## 3. Hard Constraints

- [ ] Must NOT break existing contacts (backward compatible read path)
- [ ] Phone & email visibility must continue to respect `showContact` flag
- [ ] All new fields must respect the auth gate (login required to view directory)
- [ ] No `any` in TypeScript
- [ ] Existing Admin pages must continue to function

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firestore `contacts/{id}` document shape | Internal | This project | Adding fields, none removed |
| `/api/contacts` GET response shape | Internal | This project | Adds new optional fields |
| `/api/contacts` POST/PUT request shape | Internal | This project | Accepts new fields |

---

## 5. Runtime Config Contract

### Required
No new env vars. Same as PLAN-002 / PLAN-005.

### Optional
None.

### Source
Existing Firebase credentials in `.env.local`.

### Fallback Behavior
- If `firstName` / `lastName` are missing on an existing record, derive them from `name`
  (split on whitespace, first token = firstName, rest = lastName).
- If `currentAddress` / `permanentAddress` are missing, fall back to the existing `city` field.

### Secret Handling
No new secrets. Phone/email continue to be gated by `showContact`.

---

## 6. Missing Details / Open Questions

- [ ] Should existing `city` field be retained as a separate field, or merged into `currentAddress`? → **Decision: keep `city` as a short, sortable field; `currentAddress` is the full multi-line address.**
- [ ] Should `name` be auto-computed from `firstName` + `lastName` going forward, or stored separately? → **Decision: store all three; `name` becomes a computed convenience for display when present, otherwise composed from first+last.**
- [ ] Should permanentAddress be optional? → **Decision: Yes, optional. Many won't know or want to share it.**

---

## 7. Assumptions

- Existing data already lives in the Firestore `contacts` collection (created via PLAN-005 admin UI).
- Address fields can be plain text (multi-line) — no structured parsing required.
- ~100–200 contacts total (no perf issues with extra fields).
- Backward-compatibility derivation is acceptable; no destructive migration needed.

---

## 8. Stop and Clarify If

- If the existing data lives outside Firestore (e.g., CSV / SQL), stop and design an import flow first.
- If structured address (street/city/state/pincode/country) is required, stop and split into sub-fields.
- If admin requires bulk-edit UI for migrating existing records, stop and add it.

---

## 9. Progress

- [x] Create this plan (PLAN-006)
- [ ] Update `src/types/contact.ts` with new fields
- [ ] Add backward-compat derivation helper (`deriveContactFields`)
- [ ] Update `src/app/api/contacts/route.ts` (POST: persist new fields; GET: derive missing)
- [ ] Update `src/app/api/contacts/[id]/route.ts` (PUT: persist new fields)
- [ ] Update `src/components/features/ContactForm.tsx` with new inputs
- [ ] Update `src/components/ui/ContactCard.tsx` to render new info
- [ ] Update `src/components/ui/ContactGrid.tsx` search to cover new fields
- [ ] Update `src/app/(admin)/admin/directory/page.tsx` table columns
- [ ] Update `PLANS.md` index — mark PLAN-006 complete
- [ ] Update PLAN-005 with note about extension

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-04 | Extend existing `Contact` (not new collection) | New `addressBook` collection, separate page | Avoids data duplication; reuses existing CRUD; one source of truth |
| 2026-05-04 | Keep both `city` and `currentAddress` | Merge into single field | `city` stays short for sort/filter; `currentAddress` is full free-text |
| 2026-05-04 | Plain text addresses | Structured (street/city/state) | Simpler UX; can be upgraded later if needed |
| 2026-05-04 | Backward-compat derivation, not destructive migration | Run a migration script | Safer; existing entries keep working untouched |
| 2026-05-04 | `permanentAddress` is optional | Required | Privacy — many won't share family home address |

---

## 12. Outcomes & Retrospective

_To be filled in after completion._

---

## 13. Context and Orientation

- Builds on: PLAN-005 (Directory)
- See `ARCHITECTURE.md` for routing layout
- See `src/types/contact.ts` and `src/app/api/contacts/` for current shape

---

## 14. Interfaces and Dependencies

### Inputs
- Existing `contacts` Firestore collection
- Existing PLAN-005 components and API routes

### Outputs
- Updated `Contact` type with new fields
- Updated forms, cards, table, search, and APIs handling the new fields
- Backward-compat helper for legacy records

### Internal Dependencies
- `src/types/contact.ts`
- `src/app/api/contacts/route.ts` and `[id]/route.ts`
- `src/components/features/ContactForm.tsx`
- `src/components/ui/ContactCard.tsx`
- `src/components/ui/ContactGrid.tsx`
- `src/app/(admin)/admin/directory/page.tsx`

---

## 15. Identity / Data Semantics

### Updated `contacts/{id}` Firestore Document

| Field | Type | Required | Sensitive | Notes |
|-------|------|----------|-----------|-------|
| `id` | string | auto | No | Document ID |
| `firstName` | string | ✅ (new) | No | First name |
| `lastName` | string | ✅ (new) | No | Last name |
| `name` | string | derived | No | Convenience full name (`firstName lastName`) |
| `city` | string | ✅ | No | Short city label (sort/filter) |
| `currentAddress` | string | No (new) | No | Full current postal address (multi-line) |
| `permanentAddress` | string | No (new) | No | Family / permanent address (multi-line) |
| `profession` | string | No | No | |
| `company` | string | No | No | |
| `phone` | string | No | ✅ | Gated by `showContact` |
| `email` | string | No | ✅ | Gated by `showContact` |
| `socialLink` | string | No | No | |
| `showContact` | boolean | No | No | Default: `true` |
| `createdAt` | string | auto | No | |
| `updatedAt` | string | auto | No | |

### Backward-compat read derivation
- If `firstName` is missing AND `name` is present:
  - `firstName = name.split(' ')[0]`
  - `lastName = name.split(' ').slice(1).join(' ')`
- If `currentAddress` is missing AND `city` is present:
  - `currentAddress = city`

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Update type + backward-compat helper | Small |
| Phase 2 | Update API routes (POST + PUT + GET derivation) | Small |
| Phase 3 | Update form, card, table, grid | Medium |
| Phase 4 | Verify with existing data + new entries | Small |

---

## 17. Deliverables

- [ ] Updated `src/types/contact.ts` with new fields
- [ ] New `src/lib/utils/contact.ts` with `deriveContactFields()` helper
- [ ] Updated API routes
- [ ] Updated `ContactForm`, `ContactCard`, `ContactGrid`, admin table
- [ ] Updated `PLANS.md` index

---

## 18. Concrete Steps

### Step 1 — Update Contact type
**What:** Add `firstName`, `lastName`, `currentAddress`, `permanentAddress` to `Contact` interface in `src/types/contact.ts`.
**Why:** Foundation for the rest of the changes.
**Done when:** Type compiles; no consumers broken.

### Step 2 — Add derivation helper
**What:** Create `src/lib/utils/contact.ts` exporting `deriveContactFields(raw)` that derives missing `firstName`/`lastName`/`currentAddress` from legacy fields.
**Why:** Single source of backward-compat logic; reused by GET endpoints.
**Done when:** Function returns enriched contact object with all fields populated where derivable.

### Step 3 — Update API routes
**What:**
- `POST /api/contacts`: accept new fields; auto-compose `name = firstName + lastName`.
- `PUT /api/contacts/[id]`: same.
- `GET /api/contacts` and `GET /api/contacts/[id]`: pass each contact through `deriveContactFields`.
**Why:** API persists and returns the new shape consistently.
**Done when:** Adding a new contact via the form persists all new fields; GET responses include them.

### Step 4 — Update ContactForm
**What:** Add inputs for `firstName`, `lastName`, `currentAddress` (textarea), `permanentAddress` (textarea). Remove the single `name` input — auto-compose on submit.
**Why:** Admin UX for the new schema.
**Done when:** Add and Edit forms work with new fields; existing entries pre-populate first/last name from derivation.

### Step 5 — Update ContactCard
**What:** Display `firstName lastName` prominently, show `city` (short) with a tooltip / collapsible for `currentAddress`. Truncate addresses sensibly.
**Why:** Public-facing display of richer info without overwhelming the card.
**Done when:** Cards look clean; long addresses don't break the grid.

### Step 6 — Update ContactGrid search
**What:** Extend search filter to include `firstName`, `lastName`, `currentAddress`, `permanentAddress`.
**Why:** Users will want to search by surname or by city in an address.
**Done when:** Searching for a surname or a city name in an address returns the right results.

### Step 7 — Update Admin table
**What:** Adjust columns to surface First/Last name; keep "City" as a column; keep "Visible" + "Actions". Drop or compact "Profession" if needed for width.
**Why:** Admins need to scan and identify contacts quickly.
**Done when:** Table is readable on a typical laptop screen.

### Step 8 — Update PLANS.md
**What:** Add this plan to the index (already added during creation), mark complete.
**Why:** Keeps the plan index accurate.
**Done when:** PLAN-006 row shows ✅ Complete.

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
- [ ] Adding a new contact via `/admin/directory/new` accepts firstName, lastName, currentAddress, permanentAddress
- [ ] Editing an existing contact pre-populates all new fields from derivation when missing
- [ ] `/directory` displays cards with first + last name
- [ ] Searching by last name returns the contact
- [ ] Searching for a city name within `currentAddress` returns the contact
- [ ] Admin table at `/admin/directory` displays new fields
- [ ] Existing contacts (created before this plan) continue to display correctly with derived first/last names
- [ ] `permanentAddress` is optional and may be left blank without errors
- [ ] `showContact = false` continues to hide phone and email

---

## 20. Non-Goals / Regression Guards

- Must not break existing `/directory` page for unauthenticated detection
- Must not break existing RSVP, Agenda, or Auth flows
- Must not destroy any existing contact data
- Must not require a manual data migration

---

## 21. Idempotence and Recovery

- **Idempotent?** Yes — the new fields are additive; re-saving a contact with the same values yields the same result.
- **Recovery:** If a record is corrupted, edit it via the admin UI to re-set the values.
- **Rollback:** Revert the changed files; existing data continues to work because we only added optional fields.

---

## 22. Artifacts and Notes

- Existing PLAN-005: `docs/PLAN-005-contact-address-book.md`
- Source: `src/types/contact.ts`, `src/components/features/ContactForm.tsx`, `src/components/ui/ContactCard.tsx`

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
