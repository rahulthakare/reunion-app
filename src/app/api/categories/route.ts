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

// GET /api/categories — public; list categories sorted by order
export async function GET() {
  try {
    const snapshot = await adminDb.collection("photo_categories").get();
    const categories: PhotoCategory[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PhotoCategory, "id">),
    }));
    categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[GET /api/categories] failed:", err);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

// POST /api/categories — admin only; create category
export async function POST(request: NextRequest) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<PhotoCategory>;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    const name = body.name.trim();
    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);

    // Find next order number
    const snap = await adminDb.collection("photo_categories").get();
    const maxOrder = snap.docs.reduce((acc, d) => {
      const o = (d.data().order as number) ?? 0;
      return Math.max(acc, o);
    }, 0);

    const category: Omit<PhotoCategory, "id"> = {
      name,
      slug,
      icon: body.icon?.trim() || "📷",
      description: body.description?.trim() || "",
      order: typeof body.order === "number" ? body.order : maxOrder + 1,
      createdAt: new Date().toISOString(),
      createdBy: adminUid,
    };
    const ref = await adminDb.collection("photo_categories").add(category);
    return NextResponse.json({ id: ref.id, status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/categories] failed:", err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
