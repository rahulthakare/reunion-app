"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center text-gray-400 text-sm">Loading…</div>
      </div>
    </main>
  );
}

function LoginContent() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/directory";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clearMessages() {
    setError(null);
    setPending(null);
    setInfo(null);
  }

  function switchMode(newMode: Mode) {
    clearMessages();
    setMode(newMode);
  }

  function friendlyError(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes("auth/invalid-credential") || raw.includes("auth/wrong-password"))
      return "Invalid email or password.";
    if (raw.includes("auth/user-not-found"))
      return "No account found with this email. Try Create Account instead.";
    if (raw.includes("auth/email-already-in-use"))
      return "An account already exists with this email. Try Sign In instead.";
    if (raw.includes("auth/weak-password"))
      return "Password too weak. Use at least 6 characters.";
    if (raw.includes("auth/invalid-email"))
      return "Please enter a valid email address.";
    if (raw.includes("auth/too-many-requests"))
      return "Too many attempts. Please try again in a few minutes.";
    if (raw.includes("auth/configuration-not-found"))
      return "Email/Password sign-in is not enabled in Firebase Console.";
    if (raw.includes("auth/api-key-not-valid"))
      return "Firebase config is invalid.";
    if (raw.includes("auth/network-request-failed"))
      return "Network error. Check your internet connection.";
    if (raw.startsWith("Session:")) return raw;
    return `Failed: ${raw}`;
  }

  // ─── Sign In with email/password ────────────────────────────────────────
  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      const result = await createSession();
      if (result.status === "pending") {
        setPending(result.message);
      } else {
        router.push(redirect);
      }
    } catch (err) {
      console.error("[Login] Sign-in failed:", err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Sign Up with email/password ────────────────────────────────────────
  async function handleEmailSignUp(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      const result = await createSession({ firstName, lastName });
      if (result.status === "pending") {
        setPending(result.message);
      } else {
        router.push(redirect);
      }
    } catch (err) {
      console.error("[Login] Sign-up failed:", err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Google sign-in ─────────────────────────────────────────────────────
  async function handleGoogle() {
    clearMessages();
    setLoading(true);
    try {
      await signInWithGoogle();
      const result = await createSession();
      if (result.status === "pending") {
        setPending(result.message);
      } else {
        router.push(redirect);
      }
    } catch (err) {
      console.error("[Login] Google sign-in failed:", err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Forgot password ────────────────────────────────────────────────────
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setInfo(`If an account exists for ${email}, a password reset email has been sent. Check your inbox (and spam folder).`);
    } catch (err) {
      // Firebase intentionally doesn't reveal whether an account exists for security.
      // Even if user doesn't exist, show success message.
      console.warn("[Login] Reset password (showing generic success):", err);
      setInfo(`If an account exists for ${email}, a password reset email has been sent. Check your inbox (and spam folder).`);
    } finally {
      setLoading(false);
    }
  }

  // ─── Session creation (calls our /api/auth/session) ─────────────────────
  interface SessionResult {
    status: "ok" | "pending";
    message: string;
  }

  async function createSession(extra?: { firstName?: string; lastName?: string }): Promise<SessionResult> {
    const { auth } = await import("@/lib/firebase/client");
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Session: No ID token from Firebase");
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, ...extra }),
    });
    if (res.status === 202) {
      const body = (await res.json()) as { message?: string };
      await auth.signOut();
      return {
        status: "pending",
        message: body.message ?? "Your account is awaiting approval from the reunion organizer.",
      };
    }
    if (res.status === 403) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      await auth.signOut();
      throw new Error(body.error ?? "Not authorized");
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Session: ${res.status} ${body || "creation failed"}`);
    }
    return { status: "ok", message: "Signed in" };
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-xs text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Reset Password"
              : "Sign In"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            NEHS Wardha — Batch &apos;93
          </p>
        </div>

        {/* Tabs (only show for signin/signup, not forgot) */}
        {mode !== "forgot" && (
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "border-b-2 border-indigo-600 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "border-b-2 border-indigo-600 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Banners */}
        {pending && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
            <div className="font-semibold mb-1">⏳ Awaiting approval</div>
            {pending}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
            ✅ {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ─── SIGN IN MODE ────────────────────────────────────────────── */}
        {mode === "signin" && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full mb-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                placeholder="your.email@example.com"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => switchMode("forgot")}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {/* ─── SIGN UP MODE ────────────────────────────────────────────── */}
        {mode === "signup" && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full mb-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <GoogleIcon /> Sign up with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  required
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  required
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
              <input
                type="email"
                placeholder="Email — use the one organizer has on file"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Choose a password (min 6 characters)"
                required
                minLength={6}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm password"
                required
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Only batchmates whose email is on the organizer&apos;s list will get instant access.
              Others will be queued for approval.
            </p>
          </>
        )}

        {/* ─── FORGOT PASSWORD MODE ────────────────────────────────────── */}
        {mode === "forgot" && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                placeholder="your.email@example.com"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                onClick={() => switchMode("signin")}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                ← Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
