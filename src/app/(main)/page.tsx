import Image from "next/image";
import Link from "next/link";
import { MemoryGallery } from "@/components/ui/MemoryGallery";
import { discoverMemoryImages } from "@/lib/utils/heroImages";
import { Countdown } from "@/components/ui/Countdown";
import { RSVPForm } from "@/components/ui/RSVPForm";
import { AgendaSection } from "@/components/ui/AgendaSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { adminDb } from "@/lib/firebase/admin";
import type { Agenda, AgendaItem } from "@/types/agenda";

export const dynamic = "force-dynamic";

async function getAgenda(): Promise<Agenda> {
  try {
    const doc = await adminDb.doc("config/agenda").get();
    if (!doc.exists) return { items: [] };
    const data = doc.data() as Agenda | undefined;
    const items = (data?.items ?? [])
      .slice()
      .sort((a: AgendaItem, b: AgendaItem) => (a.order ?? 0) - (b.order ?? 0));
    return { items, updatedAt: data?.updatedAt };
  } catch (err) {
    console.error("[home] Failed to fetch agenda from Firestore:", err);
    return { items: [] };
  }
}

const INFO_CARDS = [
  {
    icon: "📅",
    title: "Date",
    primary: "Saturday, 13 June 2026",
    secondary: "Save the date in your calendar",
    color: "from-brand-100 to-amber-50",
    iconBg: "bg-brand-100 text-brand-700",
  },
  {
    icon: "📍",
    title: "Venue",
    primary: "New English High School",
    secondary: "Wardha, Maharashtra",
    color: "from-accent-100 to-pink-50",
    iconBg: "bg-accent-100 text-accent-700",
  },
  {
    icon: "🎓",
    title: "Batch",
    primary: "Class of 1993",
    secondary: "30+ Year Reunion",
    color: "from-sky2-100 to-indigo-50",
    iconBg: "bg-sky2-100 text-sky2-600",
  },
];

export default async function Home() {
  const [agenda, memoryImages] = await Promise.all([
    getAgenda(),
    Promise.resolve(discoverMemoryImages()),
  ]);

  const heroImage = "/images/hero_smrutigandh.jpg";

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-indigo-950 text-white pb-24 sm:pb-28 overflow-hidden">
        {/* Layer 1: blurred ambient texture */}
        <div className="absolute inset-0 opacity-25">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover blur-2xl scale-110"
          />
        </div>
        {/* Layer 2: indigo + warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-indigo-900/85 to-indigo-950" />
        {/* Layer 2.5: warm glow at the top from brand orange */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-accent-500/15 blur-3xl pointer-events-none" />

        {/* Layer 3: Hero content */}
        <div className="relative max-w-5xl mx-auto px-6 pt-16 sm:pt-20 text-center">
          <p className="text-amber-300 text-xs font-semibold uppercase tracking-[0.3em] mb-5">
            ✨ You are invited ✨
          </p>

          <div className="flex justify-center mb-8">
            <div className="relative animate-fade-in-up">
              {/* Soft glow halo */}
              <div className="absolute -inset-6 bg-gradient-to-br from-amber-300/40 via-brand-400/30 to-accent-400/30 blur-3xl rounded-full pointer-events-none animate-pulse" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/15 bg-white/5 backdrop-blur-sm">
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

          <h1 className="heading-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-3 animate-fade-in-up">
            New English <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-amber-300 via-brand-300 to-accent-300 bg-clip-text text-transparent">
              High School
            </span>
          </h1>
          <p className="text-xl sm:text-3xl font-semibold text-indigo-100 mb-2 heading-display">
            Wardha — Batch of 1993
          </p>
          <p className="text-indigo-100/90 text-base sm:text-lg mt-4 mb-7 max-w-2xl mx-auto leading-relaxed">
            Over 30 years later, it&apos;s time to reconnect, reminisce, and celebrate
            the friendships that shaped who we are.
          </p>
          <p className="inline-flex items-center gap-2 text-amber-200 font-semibold text-sm sm:text-base mb-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur ring-1 ring-amber-300/30 shadow-lg">
            <span>📅</span>
            <span>Saturday, 13 June 2026</span>
            <span className="opacity-50">·</span>
            <span>📍</span>
            <span>NEHS, Wardha</span>
          </p>

          <div className="mb-10">
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="#rsvp"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-300 to-brand-400 text-indigo-950 font-bold px-8 py-3 rounded-full hover:shadow-glow hover:-translate-y-0.5 transition-all shadow-lg"
            >
              ✅ RSVP Now
            </a>
            <Link
              href="/directory"
              className="w-full sm:w-auto border border-white/40 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors backdrop-blur"
            >
              📒 Address Book
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto text-indigo-200 hover:text-white font-medium px-3 py-3 transition-colors"
            >
              🖼️ Gallery →
            </Link>
          </div>
          <a
            href="#details"
            className="inline-block mt-5 text-indigo-200 hover:text-amber-200 text-sm transition-colors animate-bounce"
          >
            ↓ View event details
          </a>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16"
          >
            <path
              d="M0,80 C300,0 900,80 1200,10 L1200,80 Z"
              fill="rgb(255 250 243)"
            />
          </svg>
        </div>
      </section>

      {/* ── Key info cards ───────────────────────────────────── */}
      <section id="details" className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="The essentials"
          title="Event Details"
          subtitle="Everything you need to plan your trip back to Wardha."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {INFO_CARDS.map((c, i) => (
            <div
              key={c.title}
              className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${c.color} border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-2xl ${c.iconBg} mb-4 shadow-sm`}
              >
                {c.icon}
              </div>
              <h3 className="font-bold text-gray-900 heading-display text-lg mb-1">
                {c.title}
              </h3>
              <p className="text-gray-900 font-semibold">{c.primary}</p>
              <p className="text-gray-600 text-sm mt-0.5">{c.secondary}</p>
              {/* corner accent dot */}
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/70" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Agenda ───────────────────────────────────────────── */}
      <section
        id="agenda"
        className="relative py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-white to-accent-50/40 overflow-hidden"
      >
        {/* Soft decorative blobs */}
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-accent-200/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6">
          <SectionHeading
            eyebrow="Your day"
            title="Day's Schedule"
            subtitle="Here's what we have planned — bring your appetite for memories."
          />
          <AgendaSection items={agenda.items} />
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionHeading
            eyebrow="Three decades on"
            title={
              <>
                30+ Years of <span className="text-gradient">Memories</span> 🎉
              </>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="card-pop bg-gradient-to-br from-brand-50 to-white">
              <div className="text-2xl mb-2">🏫</div>
              <p className="text-gray-700 leading-relaxed">
                It has been more than three decades since we walked the corridors of{" "}
                <strong>New English High School, Wardha</strong> together. So much has
                changed — and yet the bonds we formed as classmates remain timeless.
              </p>
            </div>
            <div className="card-pop bg-gradient-to-br from-accent-50 to-white">
              <div className="text-2xl mb-2">🤝</div>
              <p className="text-gray-700 leading-relaxed">
                This reunion is a chance to catch up with old friends, share stories of
                the years gone by, relive memories of our school days, and create new
                ones that will last another 30 years.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RSVP ────────────────────────────────────────────── */}
      <section
        id="rsvp"
        className="relative py-16 sm:py-20 bg-gradient-to-br from-indigo-50 via-accent-50/50 to-amber-50 overflow-hidden"
      >
        {/* Decorative hand-drawn vibes */}
        <div className="absolute top-10 left-10 text-7xl opacity-10 select-none">🎈</div>
        <div className="absolute bottom-10 right-10 text-7xl opacity-10 select-none">🎉</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-300/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-xl mx-auto px-6">
          <SectionHeading
            eyebrow="See you there"
            title="Will you join us?"
            subtitle="A quick RSVP helps us plan food, seating, and surprises."
          />
          <RSVPForm />
        </div>
      </section>

      {/* ── Address Book CTA ────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-brand-50 border border-indigo-100 shadow-sm p-8 sm:p-12 text-center">
            <div className="absolute top-4 left-4 text-5xl opacity-15 select-none">📞</div>
            <div className="absolute bottom-4 right-4 text-5xl opacity-15 select-none">💌</div>
            <div className="text-5xl mb-3 inline-block animate-float-med">📒</div>
            <SectionHeading
              eyebrow="Stay connected"
              title="Reconnect with Batchmates"
              subtitle="Browse the full address book of NEHS Wardha — Batch '93. See who's where, what they're doing, and how to reach out."
              decorate={false}
            />
            <Link href="/directory" className="btn-primary">
              Open Address Book →
            </Link>
            <p className="text-xs text-gray-400 mt-3">🔒 Sign-in required for privacy</p>
          </div>
        </div>
      </section>

      {/* ── Memories Gallery ────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-white via-amber-50/40 to-white overflow-hidden">
        <div className="absolute -top-10 right-10 text-6xl opacity-10 select-none rotate-12">📸</div>
        <div className="absolute bottom-10 left-10 text-6xl opacity-10 select-none -rotate-12">🎞️</div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Scrapbook"
            title={<>A glimpse of our <span className="text-gradient">memories</span></>}
            subtitle="Moments that shaped our years at NEHS Wardha. Tap any image to view it in full."
          />

          {memoryImages.length > 0 ? (
            <MemoryGallery images={memoryImages} />
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Photos coming soon…</p>
            </div>
          )}

          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm">
              Have photos to share? Bring them on{" "}
              <span className="font-semibold text-brand-700">13 June 2026</span> — we&apos;ll
              add them to the collection.
            </p>
            <Link
              href="/gallery"
              className="inline-block mt-4 btn-secondary text-sm"
            >
              🖼️ Browse the full gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative bg-gradient-to-br from-indigo-950 to-indigo-900 text-indigo-100 py-10 mt-0">
        <div className="absolute inset-0 confetti-bg opacity-20" />
        <div className="relative max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold heading-display text-white text-lg">
              🎓 NEHS Wardha — Batch &apos;93
            </p>
            <p className="text-indigo-300 text-sm mt-0.5">
              New English High School Reunion · 13 June 2026
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/articles"
              className="text-sm text-indigo-200 hover:text-amber-300 transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/gallery"
              className="text-sm text-indigo-200 hover:text-amber-300 transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/login"
              className="text-sm text-indigo-300 hover:text-amber-300 transition-colors"
            >
              Admin →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
