import Link from "next/link";
import { GradientHero } from "@/components/ui/GradientHero";
import { getFunPosts, getLeaderboard } from "@/lib/utils/funZone";

export const dynamic = "force-dynamic";

const GAMES = [
  {
    href: "/fun-zone/guess-who",
    icon: "🕵️",
    title: "Pahechan Kaun? 🕵️",
    description: "Upload an old photo of yourself anonymously and let everyone guess.",
    color: "from-pink-200 via-pink-100 to-amber-100",
    glow: "shadow-[0_10px_30px_-10px_rgba(236,72,153,0.4)]",
  },
  {
    href: "/fun-zone/caption-this",
    icon: "📝",
    title: "Caption This!",
    description: "Drop the funniest caption on a photo — most upvotes wins.",
    color: "from-amber-200 via-amber-100 to-rose-100",
    glow: "shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)]",
  },
  {
    href: "/fun-zone/memory-quiz",
    icon: "💭",
    title: "Memory Quiz",
    description: "Test your school-day recall. Faster correct answers earn more.",
    color: "from-emerald-200 via-emerald-100 to-sky2-100",
    glow: "shadow-[0_10px_30px_-10px_rgba(16,185,129,0.4)]",
  },
  {
    href: "/fun-zone/then-and-now",
    icon: "🎬",
    title: "Tevha Ani Atta? 🎬",
    description: "Compare a school-era photo with a recent one. Vote for the biggest glow-up!",
    color: "from-indigo-200 via-violet-100 to-pink-100",
    glow: "shadow-[0_10px_30px_-10px_rgba(99,102,241,0.4)]",
  },
];

export default async function FunZonePage() {
  const [recentPosts, leaderboard] = await Promise.all([
    getFunPosts(),
    getLeaderboard(5),
  ]);
  const recent = recentPosts.slice(0, 6);

  return (
    <div className="space-y-12">
      <GradientHero variant="fun" emojis={["🎉", "🎊", "🎈", "✨", "🌟", "🎂", "📸", "💌"]}>
        <div className="px-6 sm:px-10 py-12 sm:py-16 text-center animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-700 font-semibold mb-3">
            Batchmates only · Pure nostalgia
          </p>
          <h1 className="heading-display text-4xl sm:text-6xl font-bold">
            <span className="text-gradient">Welcome to the Fun Zone</span>
          </h1>
          <p className="text-gray-700 mt-3 max-w-xl mx-auto">
            Games, quizzes &amp; throwbacks — designed to make you laugh, reminisce, and relive school days.
          </p>
        </div>
      </GradientHero>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="heading-display text-2xl font-bold text-gray-900">🎮 Pick a game</h2>
          <span className="text-xs text-gray-500">{GAMES.length} games to play</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GAMES.map((g, i) => (
            <Link
              key={g.href}
              href={g.href}
              className={`group relative block rounded-3xl border border-white bg-gradient-to-br ${g.color} p-6 hover:-translate-y-1 hover:${g.glow} transition-all animate-pop-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 inline-block transition-transform">
                {g.icon}
              </div>
              <h3 className="heading-display font-bold text-gray-900 text-lg">{g.title}</h3>
              <p className="text-sm text-gray-700 mt-1.5">{g.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2 transition-all">
                Play now →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-display text-2xl font-bold text-gray-900">🏆 Top Players</h2>
          <Link href="/fun-zone/leaderboard" className="text-sm text-brand-700 hover:underline font-medium">
            View full leaderboard →
          </Link>
        </div>
        {leaderboard.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2 animate-float-fast inline-block">🥇</div>
            <p className="text-sm text-gray-500">No scores yet — be the first to play!</p>
          </div>
        ) : (
          <div className="card-pop divide-y divide-gray-100">
            {leaderboard.map((s, i) => (
              <div
                key={s.userId}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-10 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <span className="font-semibold text-gray-900">{s.userName}</span>
                </div>
                <span className="pill-brand">{s.totalPoints} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="heading-display text-2xl font-bold text-gray-900 mb-4">📰 Recent activity</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No posts yet. Start a game above!</p>
        ) : (
          <ul className="space-y-2.5">
            {recent.map((p) => (
              <li
                key={p.id}
                className="card flex items-center gap-3 hover:border-brand-200 transition-colors"
              >
                <span className="text-2xl">
                  {p.gameType === "guess-who" && "🕵️"}
                  {p.gameType === "caption-this" && "📝"}
                  {p.gameType === "memory-quiz" && "💭"}
                  {p.gameType === "then-and-now" && "🎬"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.gameType === "memory-quiz"
                      ? p.question
                      : p.prompt || `New post by ${p.uploadedByName}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.commentCount} {p.gameType === "guess-who" ? "guesses" : "comments"} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
