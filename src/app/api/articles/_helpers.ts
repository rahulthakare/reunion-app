import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface ArticleSessionUser {
  uid: string;
  email?: string;
  name: string;
  photoURL?: string;
  isAdmin: boolean;
}

export async function getArticleSessionUser(
  request: NextRequest
): Promise<ArticleSessionUser | null> {
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
