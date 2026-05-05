import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { RSVP } from "@/types/rsvp";

// POST /api/rsvp — submit a new RSVP
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RSVP>;

    // Basic validation
    if (!body.name?.trim() || !body.phone?.trim() || !body.city?.trim()) {
      return NextResponse.json(
        { error: "Name, phone, and city are required." },
        { status: 400 }
      );
    }

    // Check for duplicate phone number
    const existing = await adminDb
      .collection("rsvps")
      .where("phone", "==", body.phone.trim())
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "An RSVP with this phone number already exists." },
        { status: 409 }
      );
    }

    const rsvp: RSVP = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      city: body.city.trim(),
      withFamily: body.withFamily ?? false,
      familyCount: body.withFamily ? (body.familyCount ?? 1) : 1,
      message: body.message?.trim() ?? "",
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("rsvps").add(rsvp);

    return NextResponse.json({ id: docRef.id, status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("RSVP error:", err);
    return NextResponse.json({ error: "Failed to submit RSVP." }, { status: 500 });
  }
}

// GET /api/rsvp — list all RSVPs (admin use only, guarded by session check)
export async function GET(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    await adminAuth.verifySessionCookie(session, true);

    const snapshot = await adminDb
      .collection("rsvps")
      .orderBy("createdAt", "desc")
      .get();

    const rsvps: RSVP[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<RSVP, "id">),
    }));

    return NextResponse.json({ rsvps });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
