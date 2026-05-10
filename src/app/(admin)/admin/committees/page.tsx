import Link from "next/link";
import { getCommittees } from "@/lib/utils/committee";
import { MemberAvatarRow } from "@/components/ui/MemberAvatarRow";
import { SeedDefaultsButton } from "@/components/features/SeedDefaultsButton";

export const dynamic = "force-dynamic";

export default async function AdminCommitteesPage() {
  const committees = await getCommittees();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
          <p className="text-gray-500 mt-1">
            Organize your reunion volunteers into teams.
          </p>
        </div>
        <div className="flex gap-2">
          {committees.length === 0 && <SeedDefaultsButton />}
          <Link href="/admin/committees/new" className="btn-primary text-sm">
            + New Committee
          </Link>
        </div>
      </div>

      {committees.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="text-lg font-bold text-gray-900">No committees yet</h3>
          <p className="text-gray-500 mt-1 mb-4">
            Click &quot;Seed defaults&quot; for 10 ready-made committees, or start from scratch.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-2 pr-3">Committee</th>
                <th className="py-2 px-3">Members</th>
                <th className="py-2 px-3 hidden md:table-cell">Avatars</th>
                <th className="py-2 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {committees.map((c) => (
                <tr key={c.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{c.icon || "👥"}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-gray-700 font-medium">{c.memberCount}</span>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <MemberAvatarRow members={c.members} max={4} size="sm" />
                  </td>
                  <td className="py-3 pl-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/committees/${c.id}/edit`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Manage →
                    </Link>
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
