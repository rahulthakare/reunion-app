import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAdminUser } from "../../../_helpers";
import type { CommitteeMember, CommitteeMemberRole } from "@/types/committee";

interface RouteCtx { params: Promise<{ id: string; contactId: string }> }

// PATCH /api/committees/[id]/members/[contactId] — change role
// Body: { role }
export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, contactId } = await ctx.params;
  let body: { role?: CommitteeMemberRole };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const role = body.role;
  if (!role || !["chair", "co-chair", "member"].includes(role)) {
    return NextResponse.json({ error: "Valid role is required." }, { status: 400 });
  }

  const committeeRef = adminDb.collection("committees").doc(id);
  const snap = await committeeRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Committee not found" }, { status: 404 });

  const members: CommitteeMember[] = Array.isArray(snap.data()?.members)
    ? snap.data()!.members
    : [];
  const idx = members.findIndex((m) => m.contactId === contactId);
  if (idx < 0) return NextResponse.json({ error: "Member not found in this committee." }, { status: 404 });

  members[idx] = { ...members[idx], role };
  await committeeRef.update({ members, updatedAt: new Date().toISOString() });
  return NextResponse.json({ status: "ok" });
}

// DELETE /api/committees/[id]/members/[contactId] — remove member
export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, contactId } = await ctx.params;
  const committeeRef = adminDb.collection("committees").doc(id);
  const snap = await committeeRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Committee not found" }, { status: 404 });

  const members: CommitteeMember[] = Array.isArray(snap.data()?.members)
    ? snap.data()!.members
    : [];
  const filtered = members.filter((m) => m.contactId !== contactId);
  if (filtered.length === members.length) {
    return NextResponse.json({ error: "Member not found in this committee." }, { status: 404 });
  }

  await committeeRef.update({ members: filtered, updatedAt: new Date().toISOString() });
  return NextResponse.json({ status: "ok" });
}
