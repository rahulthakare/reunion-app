import type { ContactListItem } from "@/types/contact";
import { getDisplayName } from "@/lib/utils/contact";

/**
 * Curated palette pairs (from → to) for stable, name-keyed gradients.
 * Each gradient includes a "soft" version used for the card header background
 * so text remains highly readable on top of it.
 */
const PALETTE: { soft: string; avatar: string }[] = [
  {
    soft: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",       // brand
    avatar: "linear-gradient(135deg, #fb923c, #ea580c)",
  },
  {
    soft: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",       // accent
    avatar: "linear-gradient(135deg, #f472b6, #db2777)",
  },
  {
    soft: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",       // sky
    avatar: "linear-gradient(135deg, #22d3ee, #0891b2)",
  },
  {
    soft: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",       // violet
    avatar: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  },
  {
    soft: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",       // emerald
    avatar: "linear-gradient(135deg, #34d399, #059669)",
  },
  {
    soft: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",       // amber
    avatar: "linear-gradient(135deg, #facc15, #ca8a04)",
  },
  {
    soft: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",       // blue
    avatar: "linear-gradient(135deg, #60a5fa, #2563eb)",
  },
  {
    soft: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",       // rose
    avatar: "linear-gradient(135deg, #fb7185, #e11d48)",
  },
];

function pickPalette(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function firstLetter(s: string | undefined): string {
  if (!s) return "";
  const match = s.match(/[A-Za-z\u0900-\u097F]/);
  return match ? match[0].toUpperCase() : "";
}
function getInitials(firstName: string, lastName: string): string {
  return `${firstLetter(firstName)}${firstLetter(lastName)}` || "?";
}

interface ContactCardProps {
  contact: ContactListItem;
}

export function ContactCard({ contact }: ContactCardProps) {
  const displayName = getDisplayName(contact);
  const initials = getInitials(contact.firstName, contact.lastName);
  const palette = pickPalette(displayName);

  return (
    <article className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/*
        ── Header section ──
        A soft tinted block that *contains* the avatar + name + profession.
        It auto-grows to fit any name length so text never overflows the
        colored area.
      */}
      <header
        className="px-5 pt-5 pb-4 flex items-start gap-3"
        style={{ background: palette.soft }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-4 ring-white shadow-md"
          style={{ background: palette.avatar }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 leading-snug text-base sm:text-lg break-words hyphens-auto heading-display">
            {contact.salutation && (
              <span className="text-gray-500 font-medium mr-1">
                {contact.salutation}
              </span>
            )}
            {displayName}
          </h3>
          {contact.profession && (
            <p className="text-sm text-gray-700 break-words line-clamp-2 mt-0.5">
              {contact.profession}
              {contact.company && (
                <span className="text-gray-500"> · {contact.company}</span>
              )}
            </p>
          )}
        </div>
      </header>

      {/*
        ── Body section ──
        Clean white area with all contact details. Spacing keeps it readable
        even on small phones.
      */}
      <div className="px-5 py-4 space-y-2 text-sm flex-1 flex flex-col">
        {contact.city && (
          <div className="flex items-start gap-2 text-gray-700">
            <span className="leading-5">📍</span>
            <span className="font-medium break-words">{contact.city}</span>
          </div>
        )}

        {contact.permanentAddress && (
          <div className="flex items-start gap-2 text-gray-500 text-xs">
            <span className="leading-5">🏡</span>
            <span className="line-clamp-2 break-words">
              <span className="text-gray-400">Address: </span>
              {contact.permanentAddress}
            </span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <span>📱</span>
            <a
              href={`tel:${contact.phone}`}
              className="text-brand-700 hover:text-brand-900 font-medium hover:underline break-all"
            >
              {contact.phone}
            </a>
          </div>
        )}

        {contact.email && (
          <div className="flex items-center gap-2 text-gray-700 min-w-0">
            <span>✉️</span>
            <a
              href={`mailto:${contact.email}`}
              className="text-brand-700 hover:text-brand-900 font-medium hover:underline break-all min-w-0"
            >
              {contact.email}
            </a>
          </div>
        )}

        {contact.socialLink && (
          <a
            href={contact.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline mt-auto pt-1 group-hover:gap-2 transition-all self-start"
          >
            View profile →
          </a>
        )}
      </div>
    </article>
  );
}
