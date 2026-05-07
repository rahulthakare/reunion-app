import Image from "next/image";
import Link from "next/link";
import { MemoryGallery } from "@/components/ui/MemoryGallery";
import { discoverMemoryImages } from "@/lib/utils/heroImages";
import { Countdown } from "@/components/ui/Countdown";
import { RSVPForm } from "@/components/ui/RSVPForm";
import { AgendaSection } from "@/components/ui/AgendaSection";
import { adminDb } from "@/lib/firebase/admin";
import type { Agenda, AgendaItem } from "@/types/agenda";

// Force dynamic so we read the latest agenda from Firestore on each request.
export const dynamic = "force-dynamic";

// Call Firestore directly via Admin SDK — no HTTP self-call needed.
async function getAgenda(): Promise<Agenda> {
  try {
    const doc = await adminDb.doc("config/agenda").get();
    if (!doc.exists) return { items: [] };
    const data = doc.data() as Agenda | undefined;
    const items = (data?.items ?? []).slice().sort(
      (a: AgendaItem, b: AgendaItem) => (a.order ?? 0) - (b.order ?? 0)
    );
    return { items, updatedAt: data?.updatedAt };
  } catch (err) {
    console.error("[home] Failed to fetch agenda from Firestore:", err);
    return { items: [] };
  }
}

export default async function Home() {
  const [agenda, memoryImages] = await Promise.all([
    getAgenda(),
    Promise.resolve(discoverMemoryImages()),
  ]);

  // Smrutigandh is the singular hero image — used both as the centerpiece
  // spotlight and as the ambient blurred background.
  const heroImage = "/images/hero_smrutigandh.jpg";

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-indigo-950 text-white pb-20 overflow-hidden">
        {/* Layer 1: Blurred background image (subtle ambient texture) */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover blur-2xl scale-110"
          />
        </div>

        {/* Layer 2: Indigo gradient overlay (keeps text readable) */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-indigo-900/80 to-indigo-950" />

        {/* Layer 3: Hero content (sits above the image + gradient) */}
        <div className="relative max-w-5xl mx-auto px-6 pt-16 sm:pt-20 text-center">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">
            You are invited
          </p>

          {/* Layer 4: The featured image — sharp, centered, glowing */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Soft glow halo behind the image */}
              <div className="absolute -inset-4 bg-amber-300/30 blur-2xl rounded-full pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10 bg-white/5 backdrop-blur-sm">
                <Image
                  src={heroImage}
                  alt="Smrutigandh — NEHS Wardha Batch '93 Reunion"
                  width={486}
                  height={581}
                  priority
                  className="block w-48 sm:w-64 md:w-72 h-auto"
                />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            New English High School
          </h1>
          <p className="text-xl sm:text-3xl font-semibold text-indigo-200 mb-4">
            Wardha — Batch of 1993
          </p>
          <p className="text-indigo-200 text-base sm:text-lg mt-4 mb-6 max-w-2xl mx-auto">
            Over 30 years later, it&apos;s time to reconnect, reminisce, and celebrate
            the friendships that shaped who we are.
          </p>
          <p className="inline-block text-amber-200 font-semibold text-base sm:text-lg mb-10 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
            📅 Saturday, 13 June 2026 &nbsp;·&nbsp; 📍 NEHS, Wardha
          </p>

          {/* Countdown */}
          <div className="mb-10">
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="#rsvp"
              className="w-full sm:w-auto bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              RSVP Now
            </a>
            <Link
              href="/directory"
              className="w-full sm:w-auto border border-white/60 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              📒 Address Book
            </Link>
          </div>
          <a
            href="#details"
            className="inline-block mt-4 text-indigo-200 hover:text-white text-sm underline transition-colors"
          >
            View event details ↓
          </a>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,60 C300,0 900,60 1200,0 L1200,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── Key info cards ───────────────────────────────────── */}
      <section id="details" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Event Details</h2>
          <p className="text-gray-500">Everything you need to plan your trip back to Wardha.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 mb-1">Date</h3>
            <p className="text-indigo-600 font-semibold">Saturday, 13 June 2026</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-bold text-gray-900 mb-1">Venue</h3>
            <p className="text-indigo-600 font-semibold">New English High School</p>
            <p className="text-gray-500 text-sm">Wardha, Maharashtra</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-bold text-gray-900 mb-1">Batch</h3>
            <p className="text-indigo-600 font-semibold">Class of 1993</p>
            <p className="text-gray-500 text-sm">30+ Year Reunion</p>
          </div>
        </div>
      </section>

      {/* ── Agenda ───────────────────────────────────────────── */}
      <section id="agenda" className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Day&apos;s Schedule</h2>
            <p className="text-gray-500">Here&apos;s what we have planned for the day.</p>
          </div>
          <AgendaSection items={agenda.items} />
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            30+ Years of Memories 🎉
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            It has been more than three decades since we walked the corridors of
            <strong> New English High School, Wardha</strong> together. So much has changed —
            and yet the bonds we formed as classmates remain timeless.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            This reunion is a chance to catch up with old friends, share stories of the
            years gone by, relive memories of our school days, and create new ones that
            will last another 30 years.
          </p>
        </div>
      </section>

      {/* ── RSVP ────────────────────────────────────────────── */}
      <section id="rsvp" className="bg-indigo-50 py-16">
        <div className="max-w-xl mx-auto px-6">
          <RSVPForm />
        </div>
      </section>

      {/* ── Address Book CTA ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="card text-center bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="text-5xl mb-4">📒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reconnect with Batchmates
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Browse the full address book of NEHS Wardha — Batch &apos;93. See who&apos;s where,
              what they&apos;re doing, and how to reach out.
            </p>
            <Link
              href="/directory"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Open Address Book →
            </Link>
            <p className="text-xs text-gray-400 mt-3">Sign-in required for privacy</p>
          </div>
        </div>
      </section>

      {/* ── Memories Gallery ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              A Glimpse of Our Memories
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Moments that shaped our years at NEHS Wardha.
              Tap any image to view it in full.
            </p>
          </div>

          {memoryImages.length > 0 ? (
            <MemoryGallery images={memoryImages} />
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Photos coming soon…</p>
            </div>
          )}

          <p className="text-center text-gray-500 text-sm mt-10">
            Have photos to share? Bring them on{" "}
            <span className="font-semibold text-indigo-600">13 June 2026</span> —
            we&apos;ll add them to the collection.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">NEHS Wardha — Batch &apos;93</p>
            <p className="text-gray-400 text-sm">New English High School Reunion · 13 June 2026</p>
          </div>
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            Admin →
          </Link>
        </div>
      </footer>
    </main>
  );
}
