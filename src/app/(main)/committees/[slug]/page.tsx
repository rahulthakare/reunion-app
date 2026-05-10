import Link from "next/link";
import { notFound } from "next/navigation";
import { GradientHero } from "@/components/ui/GradientHero";
import { getCommittee } from "@/lib/utils/committee";
import { ROLE_LABEL, sortMembers } from "@/types/committee";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommitteeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const committee = await getCommittee(slug);
  if (!committee) notFound();

  const sorted = sortMembers(committee.members);
  const chair = sorted.find((m) => m.role === "chair");
  const others = sorted.filter((m) => m.role !== "chair");

  return (
    <div className="space-y-8">
      <GradientHero variant="sunset">
        <div className="px-6 sm:px-10 py-12 sm:py-14">
          <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold mb-2">
            Committee
          </p>
          <h1 className="heading-display text-4xl sm:text-5xl text-gray-900 flex items-center gap-3">
            <span>{committee.icon ?? "👥"}</span>
            <span>{committee.name}</span>
          </h1>
          {committee.description && (
            <p className="mt-3 text-gray-700 max-w-xl">{committee.description}</p>
          )}
          <Link
            href="/committees"
            className="inline-block mt-5 text-sm text-brand-700 hover:text-brand-900 font-medium"
          >
            ← All committees
          </Link>
        </div>
      </GradientHero>

      {chair && (
        <section className="card-pop max-w-md mx-auto text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">
            Chair
          </p>
          <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-orange-400 to-pink-500 text-white text-2xl font-bold flex items-center justify-center ring-4 ring-orange-100">
            {chair.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <p className="font-bold text-lg text-gray-900">{chair.name}</p>
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-4">
          <h2 className="heading-display text-2xl text-gray-900">Members</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {others.map((m) => (
              <li
                key={m.contactId}
                className="card flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {m.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() ?? "")
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900 truncate">{m.name}</p>
                  {m.role !== "member" && (
                    <p className="text-[10px] uppercase tracking-wider text-orange-600 font-semibold">
                      {ROLE_LABEL[m.role]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sorted.length === 0 && (
        <div className="text-center py-16 bg-white/60 rounded-2xl border border-orange-100">
          <div className="text-5xl mb-3">👋</div>
          <p className="text-gray-600">
            This committee doesn&apos;t have any members yet.
          </p>
        </div>
      )}
    </div>
  );
}
