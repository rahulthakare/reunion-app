import Link from "next/link";
import { notFound } from "next/navigation";
import { CommitteeForm } from "@/components/features/CommitteeForm";
import { CommitteeMemberList } from "@/components/features/CommitteeMemberList";
import { getCommittee } from "@/lib/utils/committee";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCommitteePage({ params }: PageProps) {
  const { id } = await params;
  const committee = await getCommittee(id);
  if (!committee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">{committee.icon || "👥"}</span>
            <span>{committee.name}</span>
          </h1>
          <p className="text-gray-500 mt-1">Edit details and manage members.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/committees/${committee.slug}`}
            className="btn-secondary text-sm"
            target="_blank"
          >
            View public page ↗
          </Link>
          <Link href="/admin/committees" className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>
      </div>

      <CommitteeForm committee={committee} />
      <CommitteeMemberList committee={committee} />
    </div>
  );
}
