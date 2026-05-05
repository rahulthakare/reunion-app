import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

/**
 * Admin-only check.
 */
async function isAuthorizedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return false;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
    return adminDoc.exists;
  } catch {
    return false;
  }
}

interface RouteContext {
  params: Promise<{ uid: string }>;
}

// DELETE /api/admin/pending-approvals/[uid] — reject (delete the pending entry)
// Note: we do NOT delete the Firebase Auth user — they can re-attempt signup later.
export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { uid } = await params;
  try {
    await adminDb.doc(`pending_approvals/${uid}`).delete();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[DELETE pending-approvals/${uid}] failed:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
