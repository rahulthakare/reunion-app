import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAdminUser } from "../_helpers";
import { DEFAULT_COMMITTEES } from "@/types/committee";

// POST /api/committees/seed — admin only, seed default committees
export async function POST(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date().toISOString();
  let createdCount = 0;
  let skippedCount = 0;

  for (const def of DEFAULT_COMMITTEES) {
    const existing = await adminDb
      .collection("committees")
      .where("slug", "==", def.slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      skippedCount++;
      continue;
    }
    await adminDb.collection("committees").add({
      ...def,
      members: [],
      color: "",
      createdAt: now,
      createdBy: user.uid,
      updatedAt: now,
    });
    createdCount++;
  }

  return NextResponse.json({ status: "ok", createdCount, skippedCount });
}
