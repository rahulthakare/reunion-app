"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminNavProps {
  userEmail: string;
}

export function AdminNav({ userEmail }: AdminNavProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Clear the session cookie server-side
      await fetch("/api/auth/session", { method: "DELETE" });
      // Sign out from Firebase client-side
      const { auth } = await import("@/lib/firebase/client");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + nav links */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-lg font-bold text-indigo-600">
              Reunion <span className="text-gray-900">Admin</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/agenda"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Agenda
              </Link>
              <Link
                href="/admin/attendees"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Attendees
              </Link>
              <Link
                href="/admin/directory"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Directory
              </Link>
            </div>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary text-sm"
            >
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
