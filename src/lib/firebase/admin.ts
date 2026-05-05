import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// This file is SERVER-SIDE ONLY. Never import from client components.
//
// We initialize the Admin SDK LAZILY (on first request) rather than at module
// load time. This prevents `next build` from crashing if env vars are missing
// or malformed at build time (e.g., during Vercel's static page generation).

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin SDK env vars missing: ${[
        !projectId && "FIREBASE_ADMIN_PROJECT_ID",
        !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
        !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

// Lazy proxies — Admin SDK is initialized on first property access, not at import time.
// This avoids build-time crashes during static analysis on Vercel.

let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_adminAuth) {
      _adminAuth = getAuth(getAdminApp());
    }
    const value = _adminAuth[prop as keyof Auth];
    return typeof value === "function" ? value.bind(_adminAuth) : value;
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_adminDb) {
      _adminDb = getFirestore(getAdminApp());
    }
    const value = _adminDb[prop as keyof Firestore];
    return typeof value === "function" ? value.bind(_adminDb) : value;
  },
});

export { getAdminApp };
