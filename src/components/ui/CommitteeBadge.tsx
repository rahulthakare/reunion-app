import Link from "next/link";
import type { Committee, CommitteeMemberRole } from "@/types/committee";
import { ROLE_LABEL } from "@/types/committee";

interface CommitteeBadgeProps {
  committee: Pick<Committee, "name" | "icon" | "slug">;
  role?: CommitteeMemberRole;
  asLink?: boolean;
}

export function CommitteeBadge({ committee, role, asLink = true }: CommitteeBadgeProps) {
  const content = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition-colors">
      <span aria-hidden="true">{committee.icon || "👥"}</span>
      <span>{committee.name}</span>
      {role && role !== "member" && (
        <span className="ml-1 text-[10px] uppercase tracking-wider text-orange-600">
          ({ROLE_LABEL[role]})
        </span>
      )}
    </span>
  );
  if (!asLink) return content;
  return <Link href={`/committees/${committee.slug}`}>{content}</Link>;
}
