import { getLeaderboard } from "@/lib/utils/funZone";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const scores = await getLeaderboard(100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-gray-600 mt-1">
          Points across all Fun Zone games. May the funniest, sharpest, most nostalgic batchmate win!
        </p>
      </header>

      {scores.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-5xl mb-3">🏁</div>
          <p className="text-lg font-medium text-gray-700">No scores yet</p>
          <p className="text-sm text-gray-500 mt-1">Play any game to get on the board!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left py-2 px-2">Rank</th>
                <th className="text-left py-2 px-2">Batchmate</th>
                <th className="text-right py-2 px-2">Total</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">Pahechan</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">Captions</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">Quiz</th>
                <th className="text-right py-2 px-2 hidden md:table-cell">Correct guesses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scores.map((s, i) => (
                <tr key={s.userId} className={i < 3 ? "font-medium" : ""}>
                  <td className="py-2 px-2">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </td>
                  <td className="py-2 px-2 text-gray-900">{s.userName}</td>
                  <td className="py-2 px-2 text-right text-indigo-600 font-semibold">
                    {s.totalPoints}
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell text-gray-600">
                    {s.guessWhoPoints ?? 0}
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell text-gray-600">
                    {s.captionPoints ?? 0}
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell text-gray-600">
                    {s.quizPoints ?? 0}
                  </td>
                  <td className="py-2 px-2 text-right hidden md:table-cell text-gray-600">
                    {s.correctGuesses ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
