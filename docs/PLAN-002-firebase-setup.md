# PLAN-002 — Firebase Setup

> **Status:** 🔲 Not Started
> **Created:** 2026-05-03
> **Last Updated:** 2026-05-03
> **Author:** Rovo Dev

---

## 1. Purpose / Big Picture

Configure the Firebase project that backs the Reunion App. This plan covers creating
the Firebase project in the console, enabling Authentication (email/password + Google),
initialising Firestore with the base collection schema, setting up Firebase Storage,
and deploying the initial Security Rules. Without this, no feature plan can connect
to a live backend.

---

## 2. Scope Boundaries

### In Scope
- Firebase project creation in the Firebase Console
- Enabling Firebase Authentication (email/password and Google providers)
- Firestore database creation and initial collection structure
- Firebase Storage bucket creation
- Initial Firestore and Storage Security Rules
- Populating `.env.local` with real Firebase credentials
- Creating the `admins` Firestore collection with the first admin user

### Out of Scope
- Firebase Hosting configuration (defer to deployment plan)
- Firebase Emulator Suite setup (optional, future plan)
- Advanced Firestore indexes (added as features require them)
- Push notifications (Firebase Cloud Messaging)

---

## 3. Hard Constraints

- [ ] Firebase Admin SDK credentials must NEVER be committed to version control
- [ ] Security Rules must default to deny-all; only grant what is explicitly needed
- [ ] Firestore must be created in production mode (not test mode)
- [ ] All client-side Firebase config goes in `NEXT_PUBLIC_` env vars only

---

## 4. External Contracts

| Contract | Type | Owner | Notes |
|----------|------|-------|-------|
| Firebase Auth API | External service | Google | Use stable v10 SDK |
| Firestore REST/SDK API | External service | Google | Use stable v10 SDK |
| Firebase Admin SDK | External service | Google | Server-side only, v12+ |
| `admins` Firestore collection | Internal schema | This project | Doc ID = user UID |

---

## 5. Runtime Config Contract

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase project ID (Admin SDK) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account client email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| None | — | — |

### Source
All values sourced from Firebase Console → Project Settings → Service Accounts.

### Fallback Behavior
App will fail to initialise Firebase if any required variable is missing. An error
will be logged to the console at startup.

### Secret Handling
- Admin SDK credentials stored in `.env.local` only (gitignored)
- Never logged or exposed in API responses
- Rotate credentials via Firebase Console → Service Accounts if compromised

---

## 6. Missing Details / Open Questions

- [ ] Which Firebase region should Firestore be created in? (default: `us-central1`)
- [ ] Should Firebase Emulator be configured for local development?
- [ ] Is multi-factor authentication (MFA) required for admin users?

---

## 7. Assumptions

- Developer has a Google account and can create a Firebase project.
- The Firebase free tier (Spark plan) is sufficient for initial development.
- The first admin user will be manually added to the `admins` Firestore collection.

---

## 8. Stop and Clarify If

- If Firestore region selection is ambiguous, ask before creating (it cannot be changed).
- If a paid Firebase plan is required, confirm with the project owner before upgrading.

---

## 9. Progress

- [ ] Create Firebase project in Firebase Console
- [ ] Enable Email/Password authentication provider
- [ ] Enable Google authentication provider
- [ ] Create Firestore database (production mode)
- [ ] Create Firebase Storage bucket
- [ ] Download service account key and populate `.env.local`
- [ ] Deploy initial Firestore Security Rules
- [ ] Deploy initial Storage Security Rules
- [ ] Create `admins` collection and add first admin user document
- [ ] Verify Firebase connection in dev server (no console errors)

---

## 10. Surprises & Discoveries

| Date | Discovery | Impact | Action Taken |
|------|-----------|--------|--------------|

---

## 11. Decision Log

| Date | Decision | Alternatives Considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-05-03 | Use `admins` Firestore collection for role management | Firebase Custom Claims | Firestore-based roles are easier to manage without a server-side claim-setting flow |

---

## 12. Outcomes & Retrospective

_To be filled in after completion._

---

## 13. Context and Orientation

- See `ARCHITECTURE.md` §3 (Data Flow) and §6 (Security Model)
- See `AGENT.md` for environment variable conventions
- Builds on: PLAN-001 (scaffold)
- Required before: PLAN-004 (Authentication UI), all feature plans

---

## 14. Interfaces and Dependencies

### Inputs
- Firebase Console access (Google account)
- `.env.local.example` as a template

### Outputs
- Live Firebase project with Auth, Firestore, and Storage enabled
- `.env.local` populated with real credentials
- `admins` collection with first admin user

### Internal Dependencies
- `src/lib/firebase/client.ts` — consumes `NEXT_PUBLIC_*` env vars
- `src/lib/firebase/admin.ts` — consumes `FIREBASE_ADMIN_*` env vars

---

## 15. Identity / Data Semantics

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `admins/{uid}` | `email: string`, `createdAt: timestamp` | Doc ID = Firebase Auth UID. Presence = admin role |
| `users/{uid}` | `email`, `displayName`, `createdAt` | Auto-created on first login (future plan) |

---

## 16. Plan of Work

| Phase | Description | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Firebase Console setup (Auth, Firestore, Storage) | Small |
| Phase 2 | Credentials & env vars | Small |
| Phase 3 | Security Rules | Small |
| Phase 4 | First admin user | Small |

---

## 17. Deliverables

- [ ] Firebase project live and accessible
- [ ] `.env.local` populated with real values
- [ ] Firestore `admins` collection with first admin document
- [ ] Security Rules deployed for Firestore and Storage

---

## 18. Concrete Steps

### Step 1 — Create Firebase Project
**What:** Go to [console.firebase.google.com](https://console.firebase.google.com), create a new project named `reunion-app`.
**Why:** Required to use any Firebase services.
**Done when:** Project exists and is accessible in the console.

### Step 2 — Enable Authentication Providers
**What:** In Firebase Console → Authentication → Sign-in method, enable Email/Password and Google.
**Why:** Required for login page to function.
**Done when:** Both providers show as "Enabled".

### Step 3 — Create Firestore Database
**What:** Firebase Console → Firestore → Create database → Production mode → choose region.
**Why:** Primary data store for the app.
**Done when:** Firestore database is live.

### Step 4 — Create Storage Bucket
**What:** Firebase Console → Storage → Get started.
**Why:** Required for photo uploads.
**Done when:** Storage bucket is live.

### Step 5 — Populate .env.local
**What:** Copy `.env.local.example` to `.env.local` and fill in all values from Firebase Console → Project Settings and Service Accounts.
**Why:** App cannot connect to Firebase without these credentials.
**Done when:** `npm run dev` starts with no Firebase errors in console.

### Step 6 — Deploy Security Rules
**What:** In Firebase Console, set the following Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin check helper
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    // Admins collection — read only by admins
    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Only via Admin SDK
    }
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
**Why:** Secures Firestore against unauthorised access.
**Done when:** Rules are published and enforced.

### Step 7 — Create First Admin User
**What:** In Firebase Console → Authentication, create a user. Then in Firestore, create `admins/{uid}` document with `{ email: "...", createdAt: <timestamp> }`.
**Why:** Without an admin document, no one can access the admin section.
**Done when:** Admin user can log in and access `/admin`.

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
- [ ] Firebase project exists and is accessible
- [ ] Navigating to `/login` shows the login page
- [ ] Logging in with valid admin credentials redirects to `/admin`
- [ ] Logging in with invalid credentials shows an error message
- [ ] Navigating to `/admin` without a session redirects to `/login`
- [ ] Logging out clears the session and redirects to `/login`
- [ ] Firestore Security Rules deny unauthenticated access

---

## 20. Non-Goals / Regression Guards

- Must not expose Firebase Admin credentials to the client
- Must not use Firestore in test mode in production
- Must not modify `src/lib/firebase/client.ts` or `admin.ts` structure

---

## 21. Idempotence and Recovery

- **Idempotent?** Partially — Firebase Console steps are one-time; env var setup is repeatable.
- **Recovery:** If `.env.local` is lost, regenerate from Firebase Console.
- **Rollback:** Firebase project can be deleted from the console; `.env.local` can be cleared.

---

## 22. Artifacts and Notes

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Auth docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK setup](https://firebase.google.com/docs/admin/setup)

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
