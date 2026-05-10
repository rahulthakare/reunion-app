import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAdminUser } from "../../_helpers";
import type { CommitteeMember, CommitteeMemberRole } from "@/types/committee";

interface RouteCtx { params: Promise<{ id: string }> }

// POST /api/committees/[id]/members — add a member
// Body: { contactId, role }
export async function POST(request: NextRequest, ctx: RouteCtx) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  let body: { contactId?: string; role?: CommitteeMemberRole };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const contactId = (body.contactId ?? "").trim();
  if (!contactId) return NextResponse.json({ error: "contactId is required." }, { status: 400 });

  const role: CommitteeMemberRole = body.role ?? "member";
  if (!["chair", "co-chair", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const committeeRef = adminDb.collection("committees").doc(id);
  const contactRef = adminDb.collection("contacts").doc(contactId);

  const [committeeSnap, contactSnap] = await Promise.all([committeeRef.get(), contactRef.get()]);
  if (!committeeSnap.exists) return NextResponse.json({ error: "Committee not found" }, { status: 404 });
  if (!contactSnap.exists) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const contactData = contactSnap.data() ?? {};
  const fullName =
    [contactData.firstName, contactData.lastName].filter(Boolean).join(" ").trim() ||
    contactData.name ||
    "Batchmate";
  const photoUrl = contactData.photoUrl || contactData.photoURL || undefined;

  const existingMembers: CommitteeMember[] = Array.isArray(committeeSnap.data()?.members)
    ? committeeSnap.data()!.members
    : [];
  if (existingMembers.some((m) => m.contactId === contactId)) {
    return NextResponse.json({ error: "Already a member of this committee." }, { status: 409 });
  }

  // Firestore rejects `undefined` values — only include photoUrl if present
  const newMember: CommitteeMember = {
    contactId,
    name: fullName,
    role,
    addedAt: new Date().toISOString(),
    ...(photoUrl ? { photoUrl } : {}),
  };

  await committeeRef.update({
    members: [...existingMembers, newMember],
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ status: "ok", member: newMember }, { status: 201 });
}
