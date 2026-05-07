"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/directory";

  // Hard navigation ensures the server-side rendered next page sees the new session cookie.
  // router.push() does a soft client navigation — server components would still have stale auth state.
  function navigateAfterLogin() {
    window.location.assign(redirect);
  }

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
        navigateAfterLogin();
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
        navigateAfterLogin();
      }
    } catch (err) {
      console.error("[Login] Sign-up failed:", err);
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

