import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

// POST /api/auth/session — create a session cookie from a Firebase ID token
export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken: string };

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the ID token and create a session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = NextResponse.json({ status: "ok" });
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
    console.error("[session POST] Failed to create session cookie:", message, err);
    // Return the actual error in dev for easier debugging; generic in prod.
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
