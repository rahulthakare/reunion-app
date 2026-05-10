import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface CommitteeAdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

export async function getAdminUser(
  request: NextRequest
): Promise<CommitteeAdminUser | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    let isAdmin = false;
    try {
      isAdmin = (await adminDb.doc(`admins/${decoded.uid}`).get()).exists;
    } catch {
      isAdmin = false;
    }
    return { uid: decoded.uid, email: decoded.email ?? "", isAdmin };
  } catch {
    return null;
  }
}
