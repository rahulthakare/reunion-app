import Link from "next/link";
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
  const agenda = await getAgenda();

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-indigo-700 text-white pb-16">
        <div className="max-w-5xl mx-auto px-6 pt-20 text-center">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-3">
            You are invited
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            New English High School
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-indigo-200 mb-2">
            Wardha — Batch of 1993
          </p>
          <p className="text-indigo-300 text-lg mt-4 mb-4 max-w-2xl mx-auto">
            Over 30 years later, it&apos;s time to reconnect, reminisce, and celebrate
            the friendships that shaped who we are.
          </p>
          <p className="text-indigo-200 font-semibold text-lg mb-10">
            📅 Saturday, 13 June 2026 &nbsp;·&nbsp; 📍 New English High School, Wardha
          </p>

          {/* Countdown */}
          <div className="mb-10">
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#rsvp"
              className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors shadow"
            >
              RSVP Now
            </a>
            <Link
              href="/directory"
              className="border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              📒 Address Book
            </Link>
            <a
              href="#details"
              className="text-indigo-200 hover:text-white text-sm underline transition-colors"
            >
              View event details ↓
            </a>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
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

      {/* ── Gallery teaser ──────────────────────────────────── */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Share Your Memories</h2>
          <p className="text-gray-500 mb-8">
            Dig out those old photos! We&apos;ll have a shared photo gallery for all batchmates.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-indigo-100 animate-pulse"
              />
            ))}
          </div>
          <p className="text-indigo-400 text-sm mt-4">Photo gallery coming soon…</p>
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
