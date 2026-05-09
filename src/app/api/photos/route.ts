import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { Photo } from "@/types/photo";

async function verifyAdmin(request: NextRequest): Promise<{ uid: string; name?: string } | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
    if (!adminDoc.exists) return null;
    return { uid: decoded.uid, name: decoded.name as string | undefined };
  } catch {
    return null;
  }
}

// GET /api/photos?category=<id> — public; returns photos (optionally filtered)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    let query: FirebaseFirestore.Query = adminDb.collection("photos");
    if (category) {
      query = query.where("categoryId", "==", category);
    }
    const snapshot = await query.get();
    const photos: Photo[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Photo, "id">),
    }));
    photos.sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[GET /api/photos] failed:", err);
    return NextResponse.json({ error: "Failed to fetch photos." }, { status: 500 });
  }
}

// POST /api/photos — admin only; saves metadata for an already-uploaded image
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<Photo>;
    if (!body.url || !body.storagePath || typeof body.width !== "number" || typeof body.height !== "number") {
      return NextResponse.json(
        { error: "url, storagePath, width, and height are required." },
        { status: 400 }
      );
    }

    let categorySlug: string | null = null;
    if (body.categoryId) {
      const catDoc = await adminDb.doc(`photo_categories/${body.categoryId}`).get();
      if (catDoc.exists) {
        categorySlug = (catDoc.data()?.slug as string) ?? null;
      }
    }

    const now = new Date().toISOString();
    const photo: Omit<Photo, "id"> = {
      url: body.url,
      storagePath: body.storagePath,
      alt: body.alt?.trim() || "Reunion photo",
      caption: body.caption?.trim() || "",
      width: body.width,
      height: body.height,
      uploadedAt: now,
      uploadedBy: admin.uid,
      uploadedByName: admin.name ?? "",
      categoryId: body.categoryId ?? null,
      categorySlug,
    };

    const ref = await adminDb.collection("photos").add(photo);
    return NextResponse.json({ id: ref.id, status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/photos] failed:", err);
    return NextResponse.json({ error: "Failed to save photo." }, { status: 500 });
  }
}
