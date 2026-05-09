import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getFunPosts, getComments } from "@/lib/utils/funZone";
import { MemoryQuizCard } from "@/components/features/funzone/MemoryQuizCard";
import { MemoryQuizCreator } from "@/components/features/funzone/MemoryQuizCreator";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
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

export default async function MemoryQuizPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const posts = await getFunPosts("memory-quiz");
  const commentsByPost = await Promise.all(posts.map((p) => getComments(p.id)));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💭 Memory Quiz</h1>
          <p className="text-gray-600 mt-1">
            Test your school-day recall. Answers are auto-graded — first correct gets a bonus!
          </p>
        </div>
        {user.isAdmin && <MemoryQuizCreator />}
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-5xl mb-3">🧠</div>
          <p className="text-lg font-medium text-gray-700">No quiz questions yet</p>
          <p className="text-sm text-gray-500 mt-1">
            {user.isAdmin
              ? "Add the first question above!"
              : "Check back soon — admins are cooking up questions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((p, i) => (
            <MemoryQuizCard
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
