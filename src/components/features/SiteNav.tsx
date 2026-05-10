"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/#details", label: "Event", icon: "🗓️" },
  { href: "/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/articles", label: "Articles", icon: "📰" },
  { href: "/committees", label: "Committees", icon: "👥" },
  { href: "/directory", label: "Address Book", icon: "📒", authRequired: true },
  { href: "/fun-zone", label: "Fun Zone", icon: "🎉", authRequired: true, accent: true },
  { href: "/#rsvp", label: "RSVP", icon: "✅" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

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
              className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold transition-colors"
            >
              ⚡ Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-xs bg-white/70 hover:bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <Link
        href="/login"
        className="text-xs bg-gradient-to-r from-brand-500 to-accent-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-glow hover:shadow-pop hover:-translate-y-0.5 transition-all"
      >
        Sign in
      </Link>
    );
  }

  return (
    <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-brand-100/70 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5"
        >
          <span className="inline-block animate-wiggle origin-bottom">🎓</span>
          <span className="text-gradient">NEHS</span>
          <span className="text-gray-900">Batch &apos;93</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group text-sm px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  active
                    ? link.accent
                      ? "bg-gradient-to-r from-accent-500 to-brand-500 text-white shadow-glow"
                      : "bg-brand-100 text-brand-800 font-semibold"
                    : link.accent
                    ? "text-accent-700 hover:bg-accent-50 font-medium"
                    : "text-gray-600 hover:text-brand-700 hover:bg-brand-50"
                }`}
              >
                <span className="text-xs">{link.icon}</span>
                <span>{link.label}</span>
                {mounted && link.authRequired && !user && !loading && (
                  <span className="text-xs opacity-50">🔒</span>
                )}
              </Link>
            );
          })}
          <span className="mx-2 h-5 w-px bg-gray-200" />
          {renderAuthArea()}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-brand-700 hover:bg-brand-100 transition-colors"
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
        <div className="md:hidden border-t border-brand-100/70 bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                    active
                      ? "bg-brand-100 text-brand-800 font-semibold"
                      : "text-gray-700 hover:bg-brand-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {mounted && link.authRequired && !user && !loading && (
                    <span className="text-xs opacity-50">🔒</span>
                  )}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
              {renderAuthArea()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
