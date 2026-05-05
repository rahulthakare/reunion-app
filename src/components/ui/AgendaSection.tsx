import type { AgendaItem } from "@/types/agenda";

interface AgendaSectionProps {
  items: AgendaItem[];
}

export function AgendaSection({ items }: AgendaSectionProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Agenda coming soon…
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-indigo-200 space-y-8 ml-4">
      {items.map((item, i) => (
        <li key={item.id} className="ml-6">
          {/* Timeline dot */}
          <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-indigo-600 font-semibold text-sm min-w-[90px]">
              {item.time}
            </span>
            <div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              {item.description && (
                <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
