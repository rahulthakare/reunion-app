import Link from "next/link";
import { GradientHero } from "@/components/ui/GradientHero";
import { CommitteeCard } from "@/components/features/CommitteeCard";
import { getCommittees } from "@/lib/utils/committee";

export const dynamic = "force-dynamic";

export default async function CommitteesPage() {
  const committees = await getCommittees();
  const totalMembers = committees.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="space-y-8">
      <GradientHero variant="party" emojis={["👥", "🎉", "💐", "🎭", "🍽️", "📸"]}>
        <div className="px-6 sm:px-10 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold mb-2">
            Reunion Volunteers
          </p>
          <h1 className="heading-display text-4xl sm:text-5xl text-gray-900">
            Our Committees
          </h1>
          <p className="mt-3 text-gray-700 max-w-xl">
            Meet the wonderful batchmates making this reunion happen 👥✨
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="pill-brand">
              <span className="font-semibold">{committees.length}</span> committees
            </span>
            <span className="pill-accent">
              <span className="font-semibold">{totalMembers}</span> volunteers
            </span>
          </div>
        </div>
      </GradientHero>

      {committees.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-2xl border border-orange-100">
          <div className="text-6xl mb-3">👥</div>
          <h3 className="text-lg font-bold text-gray-900">No committees yet</h3>
          <p className="text-gray-500 mt-1">
            Admins can create committees from the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {committees.map((c) => (
            <CommitteeCard key={c.id} committee={c} />
          ))}
        </div>
      )}

      <p className="text-center text-sm text-gray-500 italic pt-4">
        Want to help? Reach out to any committee chair to volunteer 🙏
      </p>

      <div className="hidden">
        <Link href="/admin/committees">Manage</Link>
      </div>
    </div>
  );
}
