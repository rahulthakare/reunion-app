import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ContactGrid } from "@/components/ui/ContactGrid";
import { GradientHero } from "@/components/ui/GradientHero";
import { deriveContactFields } from "@/lib/utils/contact";
import type { Contact, ContactListItem } from "@/types/contact";

export const dynamic = "force-dynamic";

async function getContacts(): Promise<ContactListItem[]> {
  try {
    const snapshot = await adminDb.collection("contacts").get();
    const contacts: ContactListItem[] = snapshot.docs.map((doc) => {
      const raw = { id: doc.id, ...(doc.data() as Partial<Contact>) };
      const enriched = deriveContactFields(raw);
      if (enriched.showContact === false) {
        return { ...enriched, phone: undefined, email: undefined };
      }
      return enriched;
    });
    contacts.sort((a, b) => {
      const byLast = (a.lastName ?? "").localeCompare(b.lastName ?? "");
      if (byLast !== 0) return byLast;
      return (a.firstName ?? "").localeCompare(b.firstName ?? "");
    });
    return contacts;
  } catch (err) {
    console.error("[directory] Failed to fetch contacts from Firestore:", err);
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
  // City stats for the hero
  const cities = new Set(
    contacts.map((c) => (c.city ?? "").trim().toLowerCase()).filter(Boolean)
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <GradientHero variant="calm" emojis={["📒", "📞", "💌", "🏠", "✨", "📍"]}>
        <div className="px-6 sm:px-10 py-10 sm:py-14 animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.25em] text-sky2-600 font-semibold mb-2">
            NEHS Wardha · Batch &apos;93
          </p>
          <h1 className="heading-display text-4xl sm:text-5xl font-bold">
            <span className="text-gradient">Batchmate Address Book</span>
          </h1>
          <p className="text-gray-700 mt-3 max-w-2xl">
            Find and reconnect with your classmates from 1993 — wherever life has taken them.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-5">
            <span className="pill-brand">
              👥 {contacts.length} batchmate{contacts.length === 1 ? "" : "s"}
            </span>
            <span className="pill-sky">
              🌍 {cities.size} {cities.size === 1 ? "city" : "cities"}
            </span>
            <span className="pill-amber">
              🔒 Private to batchmates
            </span>
          </div>
        </div>
      </GradientHero>

      <div className="mt-8 sm:mt-10">
        {contacts.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-amber-50 to-accent-50/50 rounded-3xl border border-amber-100">
            <p className="text-5xl mb-4 inline-block animate-float-med">👥</p>
            <p className="text-lg font-semibold text-gray-800 heading-display">
              No batchmates added yet
            </p>
            <p className="text-sm text-gray-500 mt-1">Check back soon!</p>
          </div>
        ) : (
          <ContactGrid contacts={contacts} />
        )}
      </div>
    </main>
  );
}
