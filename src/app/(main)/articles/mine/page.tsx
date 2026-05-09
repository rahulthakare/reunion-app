import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    let isAdmin = false;
    try {
      isAdmin = (await adminDb.doc(`admins/${decoded.uid}`).get()).exists;
    } catch {
      isAdmin = false;
    }
    return { uid: decoded.uid, isAdmin };
  } catch {
    return null;
  }
}

// Articles are admin-only — redirect to the appropriate landing page.
export default async function MyArticlesRedirectPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/articles");
  if (user.isAdmin) redirect("/admin/articles");
  redirect("/articles");
}
