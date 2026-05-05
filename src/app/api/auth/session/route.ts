import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

interface AuthorizationResult {
  status: "authorized" | "pending" | "rejected";
  reason?: string;
}

/**
 * Whitelist check: a user is authorized to access the app if EITHER:
 *   1. Their UID exists in the `admins` collection (admins always allowed), OR
 *   2. Their email exists in the `contacts.email` field (whitelisted batchmate)
 *
 * If neither matches, we create a `pending_approvals/{uid}` doc so the
 * admin can review and approve.
 */
async function authorizeUser(
  uid: string,
  email: string | undefined,
  provider: string,
  displayName: string | undefined
): Promise<AuthorizationResult> {
  // 1. Admin check — admins are always allowed (even if email not in contacts)
  const adminDoc = await adminDb.doc(`admins/${uid}`).get();
  if (adminDoc.exists) {
    return { status: "authorized", reason: "admin" };
  }

  // 2. No email = can't whitelist — reject
  if (!email) {
    return { status: "rejected", reason: "Account has no email — cannot verify batchmate status" };
  }

  // 3. Whitelist check against contacts.email (case-insensitive)
  const normalizedEmail = email.toLowerCase().trim();
  const contactsSnap = await adminDb
    .collection("contacts")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!contactsSnap.empty) {
    return { status: "authorized", reason: "batchmate" };
  }

  // 4. Not whitelisted — create or update pending approval
  const [firstName, ...rest] = (displayName ?? "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  await adminDb.doc(`pending_approvals/${uid}`).set(
    {
      uid,
      email: normalizedEmail,
      firstName: firstName || "",
      lastName: lastName || "",
      provider,
      requestedAt: new Date().toISOString(),
    },
    { merge: true } // re-signups update timestamp without losing earlier data
  );

  return { status: "pending" };
}

// POST /api/auth/session — verify ID token and either set session cookie or queue for approval
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      idToken: string;
      firstName?: string;
      lastName?: string;
    };
    const { idToken, firstName, lastName } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Decode token to get UID + email + provider — does NOT mint cookie yet
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    const provider = decoded.firebase?.sign_in_provider ?? "unknown";

    // Use signup form name if provided, otherwise fall back to Firebase display name
    const displayName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      decoded.name ||
      "";

    const authResult = await authorizeUser(uid, email, provider, displayName);

    if (authResult.status === "pending") {
      return NextResponse.json(
        {
          status: "pending",
          message:
            "Your account has been created and is awaiting approval from the reunion organizer. You'll be notified once approved.",
        },
        { status: 202 } // 202 Accepted — request received, awaiting action
      );
    }

    if (authResult.status === "rejected") {
      return NextResponse.json(
        { error: authResult.reason ?? "Not authorized" },
        { status: 403 }
      );
    }

    // Authorized — mint the session cookie now
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = NextResponse.json({ status: "ok", reason: authResult.reason });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[session POST] Failed:", message, err);
    const detail = process.env.NODE_ENV === "production" ? "Unauthorized" : message;
    return NextResponse.json({ error: detail }, { status: 401 });
  }
}

// DELETE /api/auth/session — clear the session cookie (logout)
export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
