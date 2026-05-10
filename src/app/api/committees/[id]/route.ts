import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAdminUser } from "../_helpers";
import { getCommittee } from "@/lib/utils/committee";

interface RouteCtx { params: Promise<{ id: string }> }

// GET /api/committees/[id] — public detail (id or slug)
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const c = await getCommittee(id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ committee: c });
}

// PATCH /api/committees/[id] — admin edit name/icon/desc/order
export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const docRef = adminDb.collection("committees").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.icon === "string") updates.icon = body.icon;
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.color === "string") updates.color = body.color;
  if (typeof body.order === "number") updates.order = body.order;

  await docRef.update(updates);
  return NextResponse.json({ status: "ok" });
}

// DELETE /api/committees/[id] — admin delete
export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  await adminDb.collection("committees").doc(id).delete();
  return NextResponse.json({ status: "ok" });
}
