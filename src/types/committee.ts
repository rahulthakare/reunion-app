export type CommitteeMemberRole = "chair" | "co-chair" | "member";

export interface CommitteeMember {
  contactId: string;
  name: string;
  photoUrl?: string;
  role: CommitteeMemberRole;
  addedAt: string;
}

export interface Committee {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  color?: string;
  order: number;
  members: CommitteeMember[];
  memberCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export const ROLE_LABEL: Record<CommitteeMemberRole, string> = {
  chair: "Chair",
  "co-chair": "Co-chair",
  member: "Member",
};

export const ROLE_ORDER: Record<CommitteeMemberRole, number> = {
  chair: 0,
  "co-chair": 1,
  member: 2,
};

export const DEFAULT_COMMITTEES: Array<
  Pick<Committee, "name" | "slug" | "icon" | "description" | "order">
> = [
  { name: "Welcome Committee", slug: "welcome", icon: "🎉", description: "Greeting batchmates on arrival, registration desk", order: 0 },
  { name: "Food & Beverages", slug: "food", icon: "🍽️", description: "Menu planning, catering coordination", order: 1 },
  { name: "Cultural Programs", slug: "cultural", icon: "🎭", description: "Performances, music, dance arrangements", order: 2 },
  { name: "Photography & Videography", slug: "photography", icon: "📸", description: "Capturing every memory", order: 3 },
  { name: "Decoration", slug: "decoration", icon: "💐", description: "Stage, venue, flower arrangements", order: 4 },
  { name: "Finance & Logistics", slug: "finance", icon: "💰", description: "Budget, contributions, expense tracking", order: 5 },
  { name: "Outreach & Communication", slug: "outreach", icon: "📢", description: "Reaching out to batchmates, RSVPs", order: 6 },
  { name: "Transport & Accommodation", slug: "transport", icon: "🚌", description: "Pickups, hotel bookings", order: 7 },
  { name: "Teacher Coordination", slug: "teachers", icon: "🙏", description: "Inviting & honoring our teachers", order: 8 },
  { name: "Souvenirs & Gifts", slug: "souvenirs", icon: "📜", description: "Mementos, gift bags", order: 9 },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortMembers(members: CommitteeMember[]): CommitteeMember[] {
  return [...members].sort((a, b) => {
    const r = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
    if (r !== 0) return r;
    return a.name.localeCompare(b.name);
  });
}
