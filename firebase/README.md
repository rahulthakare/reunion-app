# Firebase Setup Notes

This folder contains config + helpers for the Firebase project that backs the reunion app.

## 📁 Files

| File | Purpose |
|---|---|
| `cors.json` | CORS rules for the Storage bucket (allow browser uploads from local dev + Vercel) |
| `setup-cors.sh` | One-shot helper to apply `cors.json` to the bucket via `gsutil` |
| `storage.rules` | Firebase Storage security rules — copy these into the Firebase Console (Build → Storage → Rules) |

---

## 🚨 Fixing the "CORS preflight" upload error

If you see this in the browser console:

> Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin '…' has been blocked by CORS policy: Response to preflight request doesn't pass access control check.

…it means the Firebase Storage bucket doesn't allow uploads from your origin. Fix:

```bash
# from the project root
bash firebase/setup-cors.sh
```

This applies `cors.json` to `gs://reunion-app-1a3ff.firebasestorage.app`. Hard-refresh and try uploading again.

If you don't have `gsutil`:
- macOS: `brew install --cask google-cloud-sdk && gcloud init`
- Other: https://cloud.google.com/sdk/docs/install
- Then `gcloud auth login` to authenticate.

If you ever add a new domain (custom domain, new Vercel preview), edit the `origin` array in `cors.json` and re-run the script.

---

## 🔒 Storage Rules

Open https://console.firebase.google.com/project/reunion-app-1a3ff/storage/rules and paste the contents of `storage.rules` there. Click **Publish**.

These rules:
- Allow **anyone to read** images (so the public gallery / article cards work without auth)
- Allow **authenticated users to write** to `gallery/`, `articles/`, `fun-zone/`
- Server-side API routes are the **authoritative admin check** (they verify the session cookie before recording metadata in Firestore)

---

## 🔑 Service-account / Admin SDK

The Next.js server uses `firebase-admin` initialized with these env vars (set on Vercel and in `.env.local`):

```
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

These come from a service-account JSON downloaded from the Firebase Console (Project settings → Service accounts → Generate new private key).
