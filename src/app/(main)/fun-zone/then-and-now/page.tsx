import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getFunPosts, getComments } from "@/lib/utils/funZone";
import { ThenAndNowCard } from "@/components/features/funzone/ThenAndNowCard";
import { ThenAndNowUploader } from "@/components/features/funzone/ThenAndNowUploader";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
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

export default async function ThenAndNowPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const posts = await getFunPosts("then-and-now");
  const commentsByPost = await Promise.all(posts.map((p) => getComments(p.id)));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🎬 Tevha Ani Atta? <span className="text-base text-gray-500 font-medium">(Then &amp; Now)</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Two photos — school days vs. today. Vote for the biggest glow-up!
          </p>
        </div>
        <ThenAndNowUploader userId={user.uid} />
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-5xl mb-3">🎭</div>
          <p className="text-lg font-medium text-gray-700">No comparisons yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to share your transformation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((p, i) => (
            <ThenAndNowCard
              key={p.id}
              post={p}
              comments={commentsByPost[i]}
              currentUserId={user.uid}
              isAdmin={user.isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
