import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAdminUser } from "./_helpers";
import { getCommittees } from "@/lib/utils/committee";
import { slugify } from "@/types/committee";
import type { Committee } from "@/types/committee";

// GET /api/committees — public, list all committees
export async function GET() {
  try {
    const committees = await getCommittees();
    return NextResponse.json({ committees });
  } catch (err) {
    console.error("[GET committees] failed:", err);
    return NextResponse.json({ error: "Failed to fetch committees." }, { status: 500 });
  }
}

// POST /api/committees — admin only, create a committee
export async function POST(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Partial<Committee>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const slug = (body.slug || slugify(name)).trim();
  if (!slug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });

  // Slug uniqueness check
  const existing = await adminDb
    .collection("committees")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json(
      { error: `A committee with slug "${slug}" already exists.` },
      { status: 409 }
    );
  }

  // Determine display order — append to end
  const allSnap = await adminDb.collection("committees").orderBy("order", "desc").limit(1).get();
  const nextOrder = allSnap.empty
    ? 0
    : ((allSnap.docs[0].data().order as number | undefined) ?? 0) + 1;

  const now = new Date().toISOString();
  const docRef = await adminDb.collection("committees").add({
    name,
    slug,
    icon: body.icon ?? "",
    description: body.description ?? "",
    color: body.color ?? "",
    order: typeof body.order === "number" ? body.order : nextOrder,
    members: [],
    createdAt: now,
    createdBy: user.uid,
    updatedAt: now,
  });

  const created = await docRef.get();
  return NextResponse.json({
    id: docRef.id,
    ...created.data(),
  }, { status: 201 });
}
