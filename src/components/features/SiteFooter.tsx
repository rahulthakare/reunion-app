"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Footer for the main public layout.
 * Shows the "Admin" link only to actual admins, not to every visitor.
 */
export function SiteFooter() {
  const { user, loading } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const showAdminLink = !loading && isAdmin;

  return (
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
          {showAdminLink && (
            <Link
              href="/admin"
              className="text-sm text-amber-300 hover:text-amber-200 font-semibold transition-colors"
            >
              ⚡ Admin →
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
