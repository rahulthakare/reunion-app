import type { CommitteeMember } from "@/types/committee";

interface MemberAvatarRowProps {
  members: CommitteeMember[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

const PALETTE = [
  "from-orange-400 to-rose-400",
  "from-pink-400 to-purple-400",
  "from-teal-400 to-emerald-400",
  "from-amber-400 to-yellow-500",
  "from-indigo-400 to-violet-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberAvatarRow({ members, max = 5, size = "md" }: MemberAvatarRowProps) {
  if (!members || members.length === 0) {
    return <p className="text-sm text-gray-400 italic">No members yet</p>;
  }

  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div
          key={m.contactId}
          className={`${SIZE_CLASS[size]} rounded-full ring-2 ring-white shadow-sm bg-gradient-to-br ${avatarColor(m.name)} text-white font-bold flex items-center justify-center -ml-2 first:ml-0`}
          style={{ zIndex: members.length - i }}
          title={`${m.name}${m.role !== "member" ? ` · ${m.role}` : ""}`}
        >
          {initials(m.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${SIZE_CLASS[size]} rounded-full ring-2 ring-white shadow-sm bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center -ml-2`}
          title={`${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
