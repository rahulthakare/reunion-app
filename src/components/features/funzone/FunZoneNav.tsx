"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/fun-zone", label: "🏠 Home", exact: true },
  { href: "/fun-zone/guess-who", label: "🕵️ Pahechan Kaun?" },
  { href: "/fun-zone/caption-this", label: "📝 Caption This!" },
  { href: "/fun-zone/memory-quiz", label: "💭 Memory Quiz" },
  { href: "/fun-zone/then-and-now", label: "🎬 Tevha Ani Atta?" },
  { href: "/fun-zone/leaderboard", label: "🏆 Leaderboard" },
];

export function FunZoneNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-14 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                isActive(tab.href, tab.exact)
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
