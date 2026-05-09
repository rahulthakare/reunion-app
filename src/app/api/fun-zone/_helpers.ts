import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface SessionUser {
  uid: string;
  email?: string;
  name: string;
  photoURL?: string;
  isAdmin: boolean;
}

/**
 * Verifies the session cookie and returns a normalized user object,
 * or null if the request is unauthenticated.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    let isAdmin = false;
    try {
      const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
      isAdmin = adminDoc.exists;
    } catch {
      isAdmin = false;
    }
    return {
      uid: decoded.uid,
      email: decoded.email,
      name:
        (decoded.name as string | undefined) ||
        decoded.email ||
        "Batchmate",
      photoURL: decoded.picture,
      isAdmin,
    };
  } catch {
    return null;
  }
}
