"use client";

import { useState, useEffect } from "react";
import type { RSVP } from "@/types/rsvp";

export default function AdminAttendeesPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data: { rsvps?: RSVP[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setRsvps(data.rsvps ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalAttendees = rsvps.reduce(
    (sum, r) => sum + (r.withFamily ? r.familyCount : 1),
    0
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-gray-500 mt-1 text-sm">
            All RSVP submissions for the NEHS Wardha Batch &apos;93 Reunion.
          </p>
        </div>
        {!loading && (
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{rsvps.length}</p>
            <p className="text-xs text-gray-400">RSVPs ({totalAttendees} total attendees)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          Loading attendees…
        </div>
      ) : rsvps.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          No RSVPs yet. Share the link with your batchmates!
        </div>
      ) : (
        <>
          {/* ── Mobile: card layout (< md) ───────────────────────────── */}
          <div className="md:hidden space-y-3">
            {rsvps.map((rsvp, idx) => (
              <div key={rsvp.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-gray-900">{rsvp.name}</div>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  {rsvp.phone && (
                    <a href={`tel:${rsvp.phone}`} className="text-indigo-600 block">
                      📞 {rsvp.phone}
                    </a>
                  )}
                  {rsvp.city && <div className="text-gray-600">📍 {rsvp.city}</div>}
                  {rsvp.withFamily && (
                    <div className="text-indigo-600 font-medium">
                      👨‍👩‍👧 +{rsvp.familyCount - 1} family member{rsvp.familyCount - 1 !== 1 ? "s" : ""}
                    </div>
                  )}
                  {rsvp.createdAt && (
                    <div className="text-xs text-gray-400 pt-1">
                      Submitted{" "}
                      {new Date(rsvp.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: table layout (md+) ──────────────────────────── */}
          <div className="hidden md:block card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Family</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rsvps.map((rsvp, idx) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{rsvp.name}</td>
                    <td className="px-4 py-3 text-gray-500">{rsvp.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{rsvp.city}</td>
                    <td className="px-4 py-3">
                      {rsvp.withFamily
                        ? <span className="text-indigo-600 font-medium">+{rsvp.familyCount - 1}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {rsvp.createdAt
                        ? new Date(rsvp.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
