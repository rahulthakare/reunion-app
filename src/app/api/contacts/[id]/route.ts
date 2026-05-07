import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { deriveContactFields } from "@/lib/utils/contact";
import type { Contact } from "@/types/contact";

async function verifyAdmin(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
    return adminDoc.exists ? decoded : null;
  } catch {
    return null;
  }
}

// GET /api/contacts/[id] — requires auth
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await adminAuth.verifySessionCookie(session, true);
    const doc = await adminDb.doc(`contacts/${params.id}`).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const enriched = deriveContactFields({ id: doc.id, ...(doc.data() as Partial<Contact>) });
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT /api/contacts/[id] — admin only; update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as Partial<Contact>;

    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.city?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, and city are required." },
        { status: 400 }
      );
    }

    const firstName = body.firstName.trim();
    const lastName = body.lastName.trim();

    const updates: Partial<Omit<Contact, "id" | "createdAt">> = {
      salutation: body.salutation?.trim() ?? "",
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      city: body.city.trim(),
      // Prefer presentAddress; fall back to legacy currentAddress
      presentAddress: body.presentAddress?.trim() ?? body.currentAddress?.trim() ?? "",
      permanentAddress: body.permanentAddress?.trim() ?? "",
      profession: body.profession?.trim() ?? "",
      company: body.company?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
      email: body.email?.trim() ?? "",
      socialLink: body.socialLink?.trim() ?? "",
      showContact: body.showContact ?? true,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.doc(`contacts/${params.id}`).update(updates);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Contacts PUT error:", err);
    return NextResponse.json({ error: "Failed to update contact." }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] — admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await adminDb.doc(`contacts/${params.id}`).delete();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Contacts DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete contact." }, { status: 500 });
  }
}
