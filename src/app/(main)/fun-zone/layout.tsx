import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { FunZoneNav } from "@/components/features/funzone/FunZoneNav";

async function getAuthedUid(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export default async function FunZoneLayout({ children }: { children: React.ReactNode }) {
  const uid = await getAuthedUid();
  if (!uid) {
    redirect("/login?redirect=/fun-zone");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <FunZoneNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
