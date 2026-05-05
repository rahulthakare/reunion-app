# VERIFICATION.md — Reunion App

This document defines the procedures for verifying that the application and its features
are working correctly after changes are made. Run the relevant verification steps after
completing any execution plan in `docs/`.

---

## 1. Environment Setup Verification

Before running the app, confirm the environment is correctly configured.

### 1.1 Prerequisites

Ensure the following are installed:

```bash
node --version       # Should be >= 18.x
npm --version        # Should be >= 9.x
```

### 1.2 Install Dependencies

```bash
cd reunion-app
npm install
```

Expected output: No errors. `node_modules/` created.

### 1.3 Environment Variables

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with values from:
- **Client SDK**: Firebase Console → Project Settings → General → Your apps → Web app config
- **Admin SDK**: Firebase Console → Project Settings → Service Accounts → Generate new private key

Verify the file exists:
```bash
ls -la .env.local    # File should exist (never committed to git)
```

Minimum required content:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ Keep quotes around `FIREBASE_ADMIN_PRIVATE_KEY`. Keep `\n` as literal backslash-n.

### 1.4 First Admin User Setup

Before the admin section works, you must:
1. Go to **Firebase Console → Authentication** → create a user with your email
2. Go to **Firestore → Create collection** → ID: `admins`
3. Add a document with ID = your Firebase UID, field `email` = your email

---

## 2. Static Analysis Verification

Run these checks before starting the dev server.

### 2.1 TypeScript Type Check

```bash
npm run type-check
```

Expected: No errors or warnings.

### 2.2 ESLint

```bash
npm run lint
```

Expected: No errors. Warnings are acceptable but should be reviewed.

---

## 3. Development Server Verification

### 3.1 Start the Dev Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

### 3.2 Open the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

Expected: The home page loads without errors. No console errors in the browser DevTools.

### 3.3 Check for Runtime Errors

Open the browser DevTools console (F12 → Console tab).

Expected: No red errors. Warnings may be present but should be reviewed.

---

## 4. Build Verification

Verify the production build compiles successfully.

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

No build errors. Check that all routes are listed in the output.

### 4.1 Start Production Server

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) and verify the app loads correctly.

---

## 5. Feature Verification Checklist

Use this checklist after implementing features from an execution plan.
Each plan in `docs/` will also have its own **Plan-Specific Acceptance Criteria**.

### 5.1 Navigation & Routing

- [ ] Home page (`/`) loads correctly
- [ ] 404 page (`/nonexistent-route`) shows the custom not-found page
- [ ] Error boundary (`error.tsx`) catches and displays errors gracefully
- [ ] Loading states appear during page transitions

### 5.2 Authentication (once implemented)

- [ ] User can register with email/password
- [ ] User can log in with email/password
- [ ] User can log in with Google OAuth
- [ ] User is redirected to dashboard after login
- [ ] User can log out
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Auth state persists on page refresh

### 5.3 Events (once implemented)

- [ ] Events list page loads and displays events from Firestore
- [ ] Single event page loads correct data for a given event ID
- [ ] Creating a new event saves to Firestore and appears in list
- [ ] Editing an event updates Firestore correctly
- [ ] Deleting an event removes it from Firestore and the UI

### 5.4 RSVP (once implemented)

- [ ] User can RSVP to an event
- [ ] RSVP status is saved to Firestore
- [ ] RSVP count updates in real-time
- [ ] User cannot RSVP more than once to the same event

### 5.5 Photos / Storage (once implemented)

- [ ] User can upload a photo
- [ ] Uploaded photo appears in the gallery
- [ ] Photo upload errors are handled gracefully
- [ ] Photos are stored in Firebase Storage

---

## 6. Regression Verification

After any change, always re-run the following minimum set:

```bash
npm run type-check   # No TypeScript errors
npm run lint         # No ESLint errors
npm run build        # Production build succeeds
npm run dev          # Dev server starts, home page loads at http://localhost:3000
```

---

## 7. Firebase Verification

### 7.1 Firestore Connection

- [ ] App connects to Firestore without errors (check browser DevTools network tab)
- [ ] Security rules are deployed and enforced (test with Firebase Emulator or console)

### 7.2 Authentication

- [ ] Firebase Auth is initialized (no console errors about missing config)
- [ ] Auth state listener fires correctly on login/logout

### 7.3 Storage

- [ ] Firebase Storage bucket is accessible
- [ ] Uploads succeed and URLs are retrievable

---

## 8. Verification After Each Execution Plan

When completing a plan from `docs/`, follow this sequence:

1. Run static analysis:
   ```bash
   npm run type-check && npm run lint
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. Manually verify the plan-specific acceptance criteria listed in the plan's
   **Validation and Acceptance** section.

4. Run the production build:
   ```bash
   npm run build
   ```

5. Check the plan's **Progress** section and mark steps as complete.

6. Document any surprises or issues in the plan's **Surprises & Discoveries** section.
