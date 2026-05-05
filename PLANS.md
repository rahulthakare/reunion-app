# PLANS.md — Reunion App

This file serves two purposes:
1. **Index** — a running list of all execution plans for this project.
2. **Template** — the canonical structure every execution plan must follow.

All execution plans live as individual files in the `docs/` directory.

---

## Plan Index

| # | Plan File | Title | Status |
|---|-----------|-------|--------|
| 1 | [docs/PLAN-001-project-scaffold.md](docs/PLAN-001-project-scaffold.md) | Project Scaffold & Harness Setup | ✅ Complete |
| 2 | [docs/PLAN-002-firebase-setup.md](docs/PLAN-002-firebase-setup.md) | Firebase Setup (Auth, Firestore, Storage, Security Rules) | 🔲 Not Started |
| 3 | [docs/PLAN-003-tailwind-setup.md](docs/PLAN-003-tailwind-setup.md) | Tailwind CSS Integration | ✅ Complete |
| 4 | [docs/PLAN-004-authentication.md](docs/PLAN-004-authentication.md) | Authentication (Admin Section Only) | ✅ Complete |
| 5 | [docs/PLAN-005-contact-address-book.md](docs/PLAN-005-contact-address-book.md) | Contact / Address Book (Search, Sort, Pagination) | ✅ Complete |
| 6 | [docs/PLAN-006-directory-extended-fields.md](docs/PLAN-006-directory-extended-fields.md) | Directory: Extended Address Book Fields (firstName, lastName, addresses) | ✅ Complete |

> Add new plans to this table as they are created. Status values: 🔲 Not Started · 🔄 In Progress · ✅ Complete · ⏸ Blocked

---

## How to Create a New Plan

1. Copy the template below into a new file: `docs/PLAN-NNN-short-title.md`
2. Fill in every section — leave nothing blank; write `N/A` or `TBD` if unknown.
3. Add the plan to the index table above.
4. Work through the plan's **Concrete Steps** one at a time, updating **Progress** as you go.
5. After completion, fill in **Outcomes & Retrospective**.

---

## Execution Plan Template

> Copy everything below this line into your new plan file.

---

```markdown
# PLAN-NNN — [Plan Title]

> **Status:** 🔲 Not Started | 🔄 In Progress | ✅ Complete | ⏸ Blocked
> **Created:** YYYY-MM-DD
> **Last Updated:** YYYY-MM-DD
> **Author:** [Name or Agent]

---

## 1. Purpose / Big Picture

_What is this plan trying to achieve and why does it matter to the project?
One paragraph. No implementation detail here — just the "why"._

---

## 2. Scope Boundaries

### In Scope
- _List everything this plan covers._

### Out of Scope
- _List everything explicitly NOT covered by this plan._

---

## 3. Hard Constraints

_Non-negotiable rules this plan must obey. Examples: must not break existing routes,
must stay within Firebase free tier, must maintain TypeScript strict mode._

- [ ] Constraint 1
- [ ] Constraint 2

---

## 4. External Contracts

_APIs, services, or interfaces this plan depends on or must not break._

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firebase Auth API | External service | Google | Must use stable SDK |
| Firestore collections schema | Internal | This project | See types/ |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|

### Optional
| Variable | Default | Description |
|----------|---------|-------------|

### Source
_Where do these values come from? (e.g., `.env.local`, CI secrets, Firebase console)_

### Fallback Behavior
_What happens if a required variable is missing?_

### Secret Handling
_How are secrets protected? (e.g., never committed, server-side only, rotated how often)_

---

## 6. Missing Details / Open Questions

_Things you don't know yet that could affect implementation. Be specific._

- [ ] Question 1
- [ ] Question 2

---

## 7. Assumptions

_Things you are treating as true without explicit confirmation._

- Assumption 1
- Assumption 2

---

## 8. Stop and Clarify If

_Specific conditions that should pause implementation and require human input._

- If [condition], stop and ask [who] about [topic].
- If a dependency is missing or ambiguous, do not guess — ask.

---

## 9. Progress

_Updated in real time as work proceeds. Check off steps as they complete._

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

---

## 10. Surprises & Discoveries

_Unexpected findings, gotchas, or deviations from the plan. Date-stamped._

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|

---

## 11. Decision Log

_Key decisions made during implementation, with rationale._

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|

---

## 12. Outcomes & Retrospective

_Filled in after the plan is complete._

**What was delivered:**

**What went well:**

**What could be improved:**

**Follow-up plans needed:**

---

## 13. Context and Orientation

_Background context a developer or agent needs before starting this plan.
Reference relevant files, prior plans, or documentation._

- See `ARCHITECTURE.md` for system overview.
- See `AGENT.md` for conventions and constraints.
- Related plans: [list any]

---

## 14. Interfaces and Dependencies

_What does this plan produce (outputs) and what does it consume (inputs)?_

### Inputs
- Dependency 1 (e.g., Firebase project must be created)

### Outputs
- Output 1 (e.g., `src/lib/firebase/client.ts` initialized and exportable)

### Internal Dependencies
- File / module / component this plan depends on

---

## 15. Identity / Data Semantics

_Describe the key data entities involved in this plan: what they represent,
their fields, and any important constraints or invariants._

| Entity | Key Fields | Notes |
|--------|-----------|-------|

---

## 16. Plan of Work

_High-level phases or milestones, before breaking into concrete steps._

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Setup | Small |
| Phase 2 | Implementation | Medium |
| Phase 3 | Testing | Small |

---

## 17. Deliverables

_What files, features, or artifacts will exist when this plan is done?_

- [ ] Deliverable 1 (e.g., `src/lib/firebase/client.ts`)
- [ ] Deliverable 2

---

## 18. Concrete Steps

_Ordered, actionable steps. Small enough that each can be done and verified independently._

### Step 1 — [Title]
**What:** _What to do_
**Why:** _Why this step is needed_
**Done when:** _Specific, verifiable completion criteria_

### Step 2 — [Title]
**What:**
**Why:**
**Done when:**

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
_What must be true for this plan to be considered complete?_

- [ ] Criterion 1
- [ ] Criterion 2

---

## 20. Non-Goals / Regression Guards

_What must NOT change as a result of this plan? What existing behavior must be preserved?_

- Must not break: [existing feature]
- Must not modify: [specific file or contract]

---

## 21. Idempotence and Recovery

_Can this plan be re-run safely? What is the recovery procedure if something goes wrong?_

- **Idempotent?** Yes / No — explanation
- **Recovery:** If something breaks, do [X] to restore the previous state.
- **Rollback:** [git revert / manual steps]

---

## 22. Artifacts and Notes

_Links, screenshots, references, or notes that don't fit elsewhere._

- [Link to Firebase console](https://console.firebase.google.com)
- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Firestore docs](https://firebase.google.com/docs/firestore)

---

## 23. Review Checklist

_To be completed by a reviewer (human or agent) before marking the plan ✅ Complete._

- [ ] All **Deliverables** exist and are correct
- [ ] All **Concrete Steps** are marked done in **Progress**
- [ ] **Decision Log** is up to date
- [ ] **Outcomes & Retrospective** is filled in
- [ ] **Standard Post-Implementation Checklist** passes
- [ ] **Plan-Specific Acceptance Criteria** all pass
- [ ] No regressions in existing functionality
- [ ] `PLANS.md` index updated to ✅ Complete
```
