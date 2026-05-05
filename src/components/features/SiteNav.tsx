"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#details", label: "Event" },
  { href: "/directory", label: "Address Book", authRequired: true },
  { href: "/#rsvp", label: "RSVP" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await logout();
      window.location.href = "/";
    } catch {
      // best-effort
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-indigo-700 text-base">
          NEHS <span className="text-gray-900">Batch &apos;93</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("#")[0]) && link.href !== "/";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-indigo-700 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                {link.authRequired && !user && !loading && (
                  <span className="ml-1 text-xs text-gray-400">🔒</span>
                )}
              </Link>
            );
          })}

          {/* Auth state indicator */}
          {loading ? (
            <span className="text-xs text-gray-300">…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-xs text-gray-500 hover:text-indigo-600 hidden sm:inline"
              >
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
