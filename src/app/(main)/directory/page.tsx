import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { ContactGrid } from "@/components/ui/ContactGrid";
import type { ContactListItem } from "@/types/contact";

async function getContacts(): Promise<ContactListItem[]> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/contacts`,
      {
        headers: { Cookie: `session=${session}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { contacts: ContactListItem[] };
    return data.contacts;
  } catch {
    return [];
  }
}

export default async function DirectoryPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login?redirect=/directory");
  }

  try {
    await adminAuth.verifySessionCookie(session, true);
  } catch {
    redirect("/login?redirect=/directory");
  }

  const contacts = await getContacts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-2">
            NEHS Wardha — Batch &apos;93
          </p>
          <h1 className="text-3xl font-extrabold mb-1">Batchmate Address Book</h1>
          <p className="text-indigo-200 text-sm">
            Find and reconnect with your classmates from 1993.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {contacts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-medium">No batchmates added yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <ContactGrid contacts={contacts} />
        )}
      </div>
    </main>
  );
}
