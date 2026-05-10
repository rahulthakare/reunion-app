import Link from "next/link";
import type { Committee } from "@/types/committee";
import { MemberAvatarRow } from "@/components/ui/MemberAvatarRow";

interface CommitteeCardProps {
  committee: Committee;
  href?: string;
}

export function CommitteeCard({ committee, href }: CommitteeCardProps) {
  const target = href ?? `/committees/${committee.slug}`;
  const chair = committee.members.find((m) => m.role === "chair");
  return (
    <Link
      href={target}
      className="card-pop group flex flex-col gap-3 hover:border-orange-200 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{committee.icon || "👥"}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {committee.name}
          </h3>
          {committee.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{committee.description}</p>
          )}
        </div>
      </div>
      <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
        <div className="min-w-0">
          {chair && (
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Chair:</span> {chair.name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {committee.memberCount} {committee.memberCount === 1 ? "member" : "members"}
          </p>
        </div>
        <MemberAvatarRow members={committee.members} max={4} size="sm" />
      </div>
    </Link>
  );
}
