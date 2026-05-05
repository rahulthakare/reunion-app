import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { deriveContactFields } from "@/lib/utils/contact";
import type { Contact, ContactListItem } from "@/types/contact";

async function verifySession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

// GET /api/contacts — requires auth; returns all contacts (sensitive fields gated)
export async function GET(request: NextRequest) {
  const decoded = await verifySession(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection("contacts").get();

    const contacts: ContactListItem[] = snapshot.docs.map((doc) => {
      const raw = { id: doc.id, ...(doc.data() as Partial<Contact>) };
      const enriched = deriveContactFields(raw);
      // Strip sensitive fields if user opted out
      if (enriched.showContact === false) {
        return { ...enriched, phone: undefined, email: undefined };
      }
      return enriched;
    });

    // Sort by lastName then firstName for default ordering
    contacts.sort((a, b) => {
      const byLast = (a.lastName ?? "").localeCompare(b.lastName ?? "");
      if (byLast !== 0) return byLast;
      return (a.firstName ?? "").localeCompare(b.firstName ?? "");
    });

    return NextResponse.json({ contacts });
  } catch (err) {
    console.error("Contacts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch contacts." }, { status: 500 });
  }
}

// POST /api/contacts — admin only; create a new contact
export async function POST(request: NextRequest) {
  const decoded = await verifySession(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
  if (!adminDoc.exists) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    const now = new Date().toISOString();

    const contact: Omit<Contact, "id"> = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      city: body.city.trim(),
      currentAddress: body.currentAddress?.trim() ?? "",
      permanentAddress: body.permanentAddress?.trim() ?? "",
      profession: body.profession?.trim() ?? "",
      company: body.company?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
      email: body.email?.trim() ?? "",
      socialLink: body.socialLink?.trim() ?? "",
      showContact: body.showContact ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection("contacts").add(contact);
    return NextResponse.json({ id: docRef.id, status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("Contacts POST error:", err);
    return NextResponse.json({ error: "Failed to create contact." }, { status: 500 });
  }
}
