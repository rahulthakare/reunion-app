import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import type { AgendaItem } from "@/types/agenda";

const AGENDA_DOC = "config/agenda";

// GET /api/agenda — public, returns agenda items
export async function GET() {
  try {
    const doc = await adminDb.doc(AGENDA_DOC).get();
    if (!doc.exists) {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json(doc.data());
  } catch (err) {
    console.error("Agenda GET error:", err);
    return NextResponse.json({ error: "Failed to fetch agenda." }, { status: 500 });
  }
}

// PUT /api/agenda — admin only, replaces the full agenda
export async function PUT(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await adminAuth.verifySessionCookie(session, true);

    const body = (await request.json()) as { items: AgendaItem[] };

    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "items must be an array." }, { status: 400 });
    }

    const agenda = {
      items: body.items,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.doc(AGENDA_DOC).set(agenda);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Agenda PUT error:", err);
    return NextResponse.json({ error: "Failed to update agenda." }, { status: 500 });
  }
}
