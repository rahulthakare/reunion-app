import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { PendingApproval } from "@/types/pending-approval";

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

/**
 * POST /api/admin/pending-approvals/[uid]/approve
 *
 * Approves a pending signup by:
 *   1. Reading the pending_approvals/{uid} doc
 *   2. Creating a contacts/{newId} entry with email + firstName + lastName (Option C from PLAN-007)
 *   3. Deleting the pending_approvals/{uid} doc
 *
 * The user can now sign in successfully (whitelist check passes).
 */
export async function POST(_req: Request, { params }: RouteContext) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { uid } = await params;

  try {
    const pendingRef = adminDb.doc(`pending_approvals/${uid}`);
    const pendingSnap = await pendingRef.get();
    if (!pendingSnap.exists) {
      return NextResponse.json({ error: "Pending approval not found" }, { status: 404 });
    }
    const pending = { uid, ...(pendingSnap.data() as Omit<PendingApproval, "uid">) };

    // Check if a contact with this email already exists — avoid duplicates
    const existing = await adminDb
      .collection("contacts")
      .where("email", "==", pending.email)
      .limit(1)
      .get();

    if (existing.empty) {
      const now = new Date().toISOString();
      const firstName = pending.firstName ?? "";
      const lastName = pending.lastName ?? "";
      await adminDb.collection("contacts").add({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || pending.email,
        email: pending.email,
        city: "",
        currentAddress: "",
        permanentAddress: "",
        phone: "",
        profession: "",
        company: "",
        socialLink: "",
        showContact: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Delete the pending approval regardless (whether contact was newly created or already existed)
    await pendingRef.delete();

    return NextResponse.json({ status: "ok", contactCreated: existing.empty });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[POST pending-approvals/${uid}/approve] failed:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
