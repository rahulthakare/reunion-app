import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminNav } from "@/components/features/AdminNav";

export const dynamic = "force-dynamic";

interface AdminCheckResult {
  status: "ok" | "no-session" | "not-admin" | "error";
  uid?: string;
  email?: string;
}

/**
 * Returns the admin user along with WHY auth failed (if it did).
 * The caller uses the reason to redirect to the correct destination
 * — preventing redirect loops where /admin → /login → /admin.
 */
async function getAdminUser(): Promise<AdminCheckResult> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return { status: "no-session" };

  let uid: string;
  let email: string;
  try {
    // checkRevoked=false: revocation requires an extra network call to Google
    // that intermittently times out and caused redirect loops on Vercel cold
    // starts. The middleware already gates the route, and admin actions are
    // re-verified server-side in API routes — so a stale cookie here is safe.
    const decoded = await adminAuth.verifySessionCookie(session, false);
    uid = decoded.uid;
    email = decoded.email ?? "";
  } catch {
    return { status: "no-session" };
  }

  // Authoritative admin check — bypasses Firestore Security Rules via Admin SDK
  try {
    const adminDoc = await adminDb.doc(`admins/${uid}`).get();
    if (!adminDoc.exists) {
      console.warn(
        `[AdminLayout] Authenticated user ${email} (${uid}) tried to access /admin but is NOT in admins collection`
      );
      return { status: "not-admin", uid, email };
    }
  } catch (err) {
    console.error("[AdminLayout] Failed to check admins collection:", err);
    return { status: "error", uid, email };
  }

  return { status: "ok", uid, email };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getAdminUser();

  if (result.status === "ok") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav userEmail={result.email!} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  // No valid session → send to login (middleware already handles this, but
  // belt-and-suspenders for direct hits to /admin).
  if (result.status === "no-session") {
    redirect("/login?redirect=/admin");
  }

  // Authed but not an admin → send home with a friendly notice (NEVER /login,
  // because middleware would bounce them right back here, creating a loop).
  if (result.status === "not-admin") {
    redirect("/?error=not-admin");
  }

  // Firestore call genuinely errored → don't loop, render a friendly error.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900">
          Couldn&apos;t verify admin access
        </h1>
        <p className="text-gray-600 mt-2 text-sm">
          We hit a temporary network issue checking your permissions. Please
          refresh the page in a moment.
        </p>
        <a
          href="/admin"
          className="inline-block mt-5 px-4 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
        >
          Try again
        </a>
        <a
          href="/"
          className="inline-block mt-2 ml-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}
