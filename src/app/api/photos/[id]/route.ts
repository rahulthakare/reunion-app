import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb, getAdminApp } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";
import type { Photo } from "@/types/photo";

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

// PATCH /api/photos/:id — admin only; update metadata (caption, alt, category)
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
    const body = (await request.json()) as Partial<Photo>;
    const updates: Record<string, unknown> = {};
    if (typeof body.caption === "string") updates.caption = body.caption.trim();
    if (typeof body.alt === "string") updates.alt = body.alt.trim() || "Reunion photo";
    if (body.categoryId !== undefined) {
      updates.categoryId = body.categoryId;
      if (body.categoryId) {
        const catDoc = await adminDb.doc(`photo_categories/${body.categoryId}`).get();
        updates.categorySlug = catDoc.exists ? (catDoc.data()?.slug ?? null) : null;
      } else {
        updates.categorySlug = null;
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }
    await adminDb.doc(`photos/${id}`).update(updates);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[PATCH /api/photos/:id] failed:", err);
    return NextResponse.json({ error: "Failed to update photo." }, { status: 500 });
  }
}

// DELETE /api/photos/:id — admin only; removes Firestore doc + Storage file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  try {
    const docRef = adminDb.doc(`photos/${id}`);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = snap.data() as Photo;

    // Try to delete from Storage (best effort)
    if (data.storagePath) {
      try {
        const bucket = getStorage(getAdminApp()).bucket();
        await bucket.file(data.storagePath).delete({ ignoreNotFound: true });
      } catch (err) {
        console.warn("[DELETE /api/photos/:id] storage delete warning:", err);
      }
    }
    await docRef.delete();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[DELETE /api/photos/:id] failed:", err);
    return NextResponse.json({ error: "Failed to delete photo." }, { status: 500 });
  }
}
