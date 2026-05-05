import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Diagnostic — logs which fields are present so you can spot missing/wrong env vars
// Only runs in the browser, not on the server, and never logs secret values.
if (typeof window !== "undefined") {
  const status = Object.entries(firebaseConfig).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (!value) {
        acc[key] = "❌ MISSING";
      } else if (key === "apiKey") {
        acc[key] = `✓ set (${String(value).slice(0, 6)}…${String(value).slice(-4)})`;
      } else {
        acc[key] = `✓ ${value}`;
      }
      return acc;
    },
    {}
  );
  console.info("[Firebase Client] Config status:", status);
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0 && typeof window !== "undefined") {
  console.error(
    `[Firebase Client] Missing required env vars: ${missingKeys.join(", ")}. ` +
      `Restart the dev server after editing .env.local.`
  );
}

// Prevent re-initializing the app on hot reload in development
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
