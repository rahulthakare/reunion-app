import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/utils/photo";
import type { PhotoCategory } from "@/types/photo";

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
    if (!adminDoc.exists) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// PATCH /api/categories/:id — admin only; rename/reorder/edit category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  try {
    const body = (await request.json()) as Partial<PhotoCategory>;
    const updates: Record<string, unknown> = {};
    if (body.name?.trim()) {
      updates.name = body.name.trim();
      if (!body.slug) updates.slug = slugify(body.name);
    }
    if (body.slug?.trim()) updates.slug = slugify(body.slug);
    if (typeof body.icon === "string") updates.icon = body.icon.trim() || "📷";
    if (typeof body.description === "string") updates.description = body.description.trim();
    if (typeof body.order === "number") updates.order = body.order;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }
    await adminDb.doc(`photo_categories/${id}`).update(updates);

    // If slug changed, re-sync photos that belong to this category
    if (updates.slug) {
      const photos = await adminDb.collection("photos").where("categoryId", "==", id).get();
      const batch = adminDb.batch();
      photos.docs.forEach((doc) => batch.update(doc.ref, { categorySlug: updates.slug }));
      if (!photos.empty) await batch.commit();
    }
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[PATCH /api/categories/:id] failed:", err);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

// DELETE /api/categories/:id?mode=move|delete — admin only
//   mode=move (default): move all photos in this category to uncategorized
//   mode=delete: also delete all photos (NOT their storage files; use admin photo delete for that)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "move";

  try {
    const photos = await adminDb.collection("photos").where("categoryId", "==", id).get();
    const batch = adminDb.batch();
    photos.docs.forEach((doc) => {
      if (mode === "delete") {
        batch.delete(doc.ref);
      } else {
        batch.update(doc.ref, { categoryId: null, categorySlug: null });
      }
    });
    if (!photos.empty) await batch.commit();
    await adminDb.doc(`photo_categories/${id}`).delete();
    return NextResponse.json({ status: "ok", affectedPhotos: photos.size });
  } catch (err) {
    console.error("[DELETE /api/categories/:id] failed:", err);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
