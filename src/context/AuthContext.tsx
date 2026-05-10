"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import type { AppUser } from "@/types/user";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function buildAppUser(firebaseUser: User): Promise<AppUser> {
  // For admin status, ask the server (which uses the Admin SDK and bypasses
  // Firestore Security Rules). Client-side reads of `admins` are typically
  // denied by rules and would always return isAdmin=false, incorrectly
  // overwriting the correct value from the server-side session check.
  let isAdmin = false;
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) {
      const body = (await res.json()) as { user: AppUser | null };
      if (body.user?.uid === firebaseUser.uid) {
        isAdmin = !!body.user.isAdmin;
      }
    }
  } catch (err) {
    console.warn("[AuthContext] Could not refresh isAdmin from server:", err);
  }
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAdmin,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 1. Authoritative server-side check via session cookie (httpOnly, survives
    //    mobile Safari / private browsing where Firebase IndexedDB may fail).
    //    This runs once on mount and is the source of truth for "is the user
    //    signed in?". Without this, mobile users can appear logged-out in the
    //    UI even when their session cookie is valid.
    async function loadFromServerSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as { user: AppUser | null };
        if (!cancelled) {
          setUser(body.user);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[AuthContext] /api/auth/session check failed:", err);
        if (!cancelled) setLoading(false);
      }
    }
    void loadFromServerSession();

    // 2. Also subscribe to client-side Firebase state changes — this keeps the
    //    UI reactive when the user signs in or signs out from a client action.
    //    onAuthStateChanged result wins over the server check ONLY when it
    //    actually fires (skipped silently on mobile if SDK persistence fails).
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const appUser = await buildAppUser(firebaseUser);
          if (!cancelled) setUser(appUser);
        } else {
          // Don't immediately clear `user` here — the server-side cookie may
          // still be valid (esp. on mobile where SDK persistence is flaky).
          // Re-check with the server before declaring the user logged out.
          try {
            const res = await fetch("/api/auth/session", {
              credentials: "include",
              cache: "no-store",
            });
            if (cancelled) return;
            if (res.ok) {
              const body = (await res.json()) as { user: AppUser | null };
              setUser(body.user);
            } else {
              setUser(null);
            }
          } catch {
            if (!cancelled) setUser(null);
          }
        }
      } catch (err) {
        console.error("[AuthContext] onAuthStateChanged handler failed:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
