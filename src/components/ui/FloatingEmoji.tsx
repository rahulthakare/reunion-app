/**
 * Decorative floating emoji background. Hidden from screen readers.
 * Pass an array of emojis OR a preset name. Each emoji is positioned
 * randomly using a deterministic seed (so renders are stable).
 */

interface FloatingEmojiProps {
  emojis?: string[];
  count?: number;
  className?: string;
}

const PALETTE: { emoji: string; size: string; speed: string; opacity: string }[] = [
  { emoji: "🎉", size: "text-3xl sm:text-4xl", speed: "animate-float-slow", opacity: "opacity-50" },
  { emoji: "🎈", size: "text-3xl sm:text-5xl", speed: "animate-float-med", opacity: "opacity-40" },
  { emoji: "✨", size: "text-2xl sm:text-3xl", speed: "animate-float-fast", opacity: "opacity-60" },
  { emoji: "🎊", size: "text-3xl sm:text-4xl", speed: "animate-float-med", opacity: "opacity-45" },
  { emoji: "📸", size: "text-2xl sm:text-3xl", speed: "animate-float-slow", opacity: "opacity-40" },
  { emoji: "💌", size: "text-2xl sm:text-3xl", speed: "animate-float-med", opacity: "opacity-40" },
  { emoji: "🌟", size: "text-2xl sm:text-3xl", speed: "animate-float-fast", opacity: "opacity-50" },
  { emoji: "🎂", size: "text-3xl sm:text-4xl", speed: "animate-float-slow", opacity: "opacity-40" },
];

// Deterministic positions so SSR and client match
const POSITIONS: { top: string; left: string; rotate: string }[] = [
  { top: "8%", left: "6%", rotate: "rotate-[-8deg]" },
  { top: "18%", left: "82%", rotate: "rotate-[12deg]" },
  { top: "55%", left: "4%", rotate: "rotate-[6deg]" },
  { top: "75%", left: "88%", rotate: "rotate-[-15deg]" },
  { top: "32%", left: "45%", rotate: "rotate-[18deg]" },
  { top: "68%", left: "30%", rotate: "rotate-[-6deg]" },
  { top: "12%", left: "55%", rotate: "rotate-[8deg]" },
  { top: "85%", left: "60%", rotate: "rotate-[-20deg]" },
];

export function FloatingEmoji({
  emojis,
  count,
  className = "",
}: FloatingEmojiProps) {
  const list = emojis
    ? emojis.map((e, i) => ({
        ...PALETTE[i % PALETTE.length],
        emoji: e,
      }))
    : PALETTE;
  const items = list.slice(0, count ?? list.length);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((item, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        return (
          <span
            key={i}
            className={`absolute select-none ${item.size} ${item.speed} ${item.opacity} ${pos.rotate}`}
            style={{ top: pos.top, left: pos.left }}
          >
            {item.emoji}
          </span>
        );
      })}
    </div>
  );
}
