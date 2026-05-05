import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { PendingApproval } from "@/types/pending-approval";

/**
 * Admin-only middleware: returns the verified admin's UID, or null if not authorized.
 */
async function getAuthorizedAdminUid(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
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

// GET /api/admin/pending-approvals — list all pending approvals
export async function GET() {
  const adminUid = await getAuthorizedAdminUid();
  if (!adminUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const snap = await adminDb
      .collection("pending_approvals")
      .orderBy("requestedAt", "desc")
      .get();
    const items: PendingApproval[] = snap.docs.map((d) => ({
      ...(d.data() as Omit<PendingApproval, "uid">),
      uid: d.id,
    }));
    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/admin/pending-approvals] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
