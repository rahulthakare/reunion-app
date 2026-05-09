"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminNavProps {
  userEmail: string;
}

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/attendees", label: "Attendees" },
  { href: "/admin/directory", label: "Directory" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/pending-approvals", label: "Approvals", showBadge: true },
];

export function AdminNav({ userEmail }: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    // Exact match for /admin (Dashboard) so it isn't active for every /admin/* page
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Fetch pending approvals count once on mount and refresh every 60s
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/pending-approvals", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { count?: number };
        if (mounted && typeof body.count === "number") {
          setPendingCount(body.count);
        }
      } catch {
        // ignore
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      const { auth } = await import("@/lib/firebase/client");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  function renderBadge() {
    if (pendingCount === null || pendingCount === 0) return null;
    return (
      <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold">
        {pendingCount > 99 ? "99+" : pendingCount}
      </span>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="text-lg font-bold text-indigo-600">
            Reunion <span className="text-gray-900">Admin</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-sm transition-colors flex items-center ${
                  isActive(link.href)
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                {link.showBadge && renderBadge()}
              </Link>
            ))}
          </div>

          {/* Desktop user info + logout */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden lg:block">{userEmail}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary text-sm"
            >
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
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
            {/* Show a small dot if there are pending approvals (so admin notices even with menu closed) */}
            {!mobileOpen && pendingCount !== null && pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    isActive(link.href)
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.showBadge && renderBadge()}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="px-3 text-xs text-gray-500 truncate mb-2">
                Signed in as {userEmail}
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full btn-secondary text-sm"
              >
                {loggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
