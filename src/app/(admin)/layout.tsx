import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminNav } from "@/components/features/AdminNav";

export const dynamic = "force-dynamic";

interface AdminUser {
  uid: string;
  email: string;
}

/**
 * Returns the admin user IF AND ONLY IF:
 *   1. The session cookie is valid (proven by Firebase Admin SDK), AND
 *   2. The user's UID exists in the `admins` Firestore collection
 *
 * Otherwise returns null — the caller will redirect to /login.
 */
async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  let uid: string;
  let email: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
    email = decoded.email ?? "";
  } catch {
    return null;
  }

  // Authoritative admin check — bypasses Firestore Security Rules via Admin SDK
  const adminDoc = await adminDb.doc(`admins/${uid}`).get();
  if (!adminDoc.exists) {
    console.warn(
      `[AdminLayout] Authenticated user ${email} (${uid}) tried to access /admin but is NOT in admins collection`
    );
    return null;
  }

  return { uid, email };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav userEmail={adminUser.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
