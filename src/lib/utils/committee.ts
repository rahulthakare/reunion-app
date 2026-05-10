import { adminDb } from "@/lib/firebase/admin";
import type { Committee, CommitteeMember } from "@/types/committee";
import { sortMembers } from "@/types/committee";

const COL = "committees";

function docToCommittee(snap: FirebaseFirestore.DocumentSnapshot): Committee {
  const data = snap.data() ?? {};
  const members: CommitteeMember[] = Array.isArray(data.members) ? data.members : [];
  return {
    id: snap.id,
    name: data.name ?? "",
    slug: data.slug ?? snap.id,
    icon: data.icon,
    description: data.description,
    color: data.color,
    order: typeof data.order === "number" ? data.order : 999,
    members: sortMembers(members),
    memberCount: members.length,
    createdAt: data.createdAt ?? "",
    createdBy: data.createdBy ?? "",
    updatedAt: data.updatedAt ?? "",
  };
}

export async function getCommittees(): Promise<Committee[]> {
  try {
    const snap = await adminDb.collection(COL).orderBy("order", "asc").get();
    return snap.docs.map(docToCommittee);
  } catch (err) {
    console.error("[getCommittees] failed:", err);
    return [];
  }
}

export async function getCommittee(idOrSlug: string): Promise<Committee | null> {
  try {
    // Try direct id lookup
    const direct = await adminDb.collection(COL).doc(idOrSlug).get();
    if (direct.exists) return docToCommittee(direct);
    // Fallback: lookup by slug
    const q = await adminDb
      .collection(COL)
      .where("slug", "==", idOrSlug)
      .limit(1)
      .get();
    if (q.empty) return null;
    return docToCommittee(q.docs[0]);
  } catch (err) {
    console.error("[getCommittee] failed:", err);
    return null;
  }
}

export async function getCommitteesForContact(contactId: string): Promise<Committee[]> {
  try {
    const all = await getCommittees();
    return all.filter((c) => c.members.some((m) => m.contactId === contactId));
  } catch (err) {
    console.error("[getCommitteesForContact] failed:", err);
    return [];
  }
}
