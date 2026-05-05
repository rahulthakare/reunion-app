"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await logout();
      window.location.href = "/";
    } catch {
      // best-effort
    }
  }

  function isActive(href: string) {
    // Hash links (e.g. /#details) are anchor jumps within a page —
    // never treat them as "current page" highlights.
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function renderAuthArea() {
    if (!mounted || loading) {
      return <span className="text-xs text-gray-300 w-16 inline-block">&nbsp;</span>;
    }
    if (user) {
      return (
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <Link
              href="/admin"
              className="text-xs text-gray-500 hover:text-indigo-600"
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <Link
        href="/login"
        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
      >
        Sign in
      </Link>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-indigo-700 text-base">
          NEHS <span className="text-gray-900">Batch &apos;93</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isActive(link.href)
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
              {mounted && link.authRequired && !user && !loading && (
                <span className="ml-1 text-xs text-gray-400">🔒</span>
              )}
            </Link>
          ))}
          {renderAuthArea()}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{link.label}</span>
                {mounted && link.authRequired && !user && !loading && (
                  <span className="text-xs text-gray-400">🔒</span>
                )}
              </Link>
            ))}
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
              {renderAuthArea()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
