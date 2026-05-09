import Link from "next/link";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ArticleList } from "@/components/features/ArticleList";
import { GradientHero } from "@/components/ui/GradientHero";
import { getPublishedArticles } from "@/lib/utils/article";
import type { Article } from "@/types/article";

export const dynamic = "force-dynamic";

async function getViewer() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return { authed: false, isAdmin: false };
  try {
    const decoded = await adminAuth.verifySessionCookie(session, false);
    let isAdmin = false;
    try {
      isAdmin = (await adminDb.doc(`admins/${decoded.uid}`).get()).exists;
    } catch {
      isAdmin = false;
    }
    return { authed: true, isAdmin };
  } catch {
    return { authed: false, isAdmin: false };
  }
}

function groupBySection(articles: Article[]): Map<string, Article[]> {
  const groups = new Map<string, Article[]>();
  for (const a of articles) {
    const key = a.section?.trim() || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }
  return groups;
}

export default async function ArticlesIndexPage() {
  const [articles, viewer] = await Promise.all([getPublishedArticles(), getViewer()]);
  const grouped = groupBySection(articles);
  const sections = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <GradientHero variant="sunset" emojis={["📰", "✏️", "📖", "💌", "✨", "📜"]}>
        <div className="px-6 sm:px-10 py-10 sm:py-14 flex flex-col sm:flex-row sm:items-end gap-6 justify-between animate-fade-in-up">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-semibold mb-2">
              The Batch &apos;93 Gazette
            </p>
            <h1 className="heading-display text-4xl sm:text-5xl font-bold text-gray-900">
              <span className="text-gradient">Articles &amp; Stories</span>
            </h1>
            <p className="text-gray-700 mt-2 max-w-xl">
              Memories, essays &amp; reflections — curated by the reunion editorial team.
            </p>
          </div>
          {viewer.isAdmin && (
            <div className="flex gap-2 shrink-0">
              <Link href="/admin/articles" className="btn-secondary text-sm">
                Manage
              </Link>
              <Link href="/articles/new" className="btn-primary text-sm">
                ✍️ New article
              </Link>
            </div>
          )}
        </div>
      </GradientHero>

      <div className="mt-10">
        {articles.length === 0 ? (
          <ArticleList articles={[]} emptyText="No articles published yet — check back soon!" />
        ) : sections.length === 1 ? (
          <ArticleList articles={articles} />
        ) : (
          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={section} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="heading-display text-2xl font-bold text-gray-900">
                    {section}
                  </h2>
                  <span className="h-px flex-1 bg-gradient-to-r from-brand-200 via-accent-200 to-transparent" />
                  <span className="pill-brand">{grouped.get(section)?.length ?? 0}</span>
                </div>
                <ArticleList articles={grouped.get(section) ?? []} />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
