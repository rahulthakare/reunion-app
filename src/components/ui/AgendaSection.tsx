import type { AgendaItem } from "@/types/agenda";

interface AgendaSectionProps {
  items: AgendaItem[];
}

const DOT_COLORS = [
  "bg-brand-500",
  "bg-accent-500",
  "bg-amber-500",
  "bg-sky2-500",
  "bg-emerald-500",
  "bg-violet-500",
];

export function AgendaSection({ items }: AgendaSectionProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <div className="text-4xl mb-2">🗓️</div>
        <p>Agenda coming soon…</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-6 ml-2 sm:ml-4">
      {/* Vertical gradient rail */}
      <span
        aria-hidden="true"
        className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-brand-300 via-accent-300 to-amber-200 rounded-full"
      />
      {items.map((item, idx) => {
        const dotColor = DOT_COLORS[idx % DOT_COLORS.length];
        return (
          <li key={item.id} className="relative pl-8">
            <span
              className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white shadow ${dotColor}`}
              aria-hidden="true"
            />
            <div className="card-pop bg-white/95 hover:border-brand-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-brand-700 font-bold text-sm min-w-[80px] tabular-nums">
                  {item.time}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 heading-display">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
