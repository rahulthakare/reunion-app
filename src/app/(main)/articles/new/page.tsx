import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ArticleEditor } from "@/components/features/ArticleEditor";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, false);
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

export default async function NewArticlePage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/articles/new");
  if (!user.isAdmin) {
    // Non-admins can only view articles
    redirect("/articles");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Link href="/admin/articles" className="text-sm text-indigo-600 hover:underline">
          ← Back to articles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">✍️ New article</h1>
        <p className="text-gray-600 mt-1">
          Choose between a free-text article or a PDF upload.
        </p>
      </header>
      <ArticleEditor authorUid={user.uid} />
    </main>
  );
}
