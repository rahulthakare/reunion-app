"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContactListItem } from "@/types/contact";

interface CommitteeMemberPickerProps {
  excludeContactIds: string[];
  onPick: (contact: ContactListItem) => void;
  onClose: () => void;
}

export function CommitteeMemberPicker({
  excludeContactIds,
  onPick,
  onClose,
}: CommitteeMemberPickerProps) {
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/contacts", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const data = await res.json();
        if (!cancelled) setContacts(data.contacts ?? []);
      } catch (e) {
        console.error("[CommitteeMemberPicker] load failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const excludeSet = useMemo(() => new Set(excludeContactIds), [excludeContactIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => !excludeSet.has(c.id))
      .filter((c) => {
        if (!q) return true;
        const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
        return name.includes(q) || (c.profession ?? "").toLowerCase().includes(q);
      })
      .slice(0, 50);
  }, [contacts, search, excludeSet]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">Add a member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <input
            type="search"
            placeholder="Search batchmates by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="input-field"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading batchmates…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {search ? "No matches." : "No batchmates available."}
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const fullName = [c.firstName, c.lastName]
                  .filter(Boolean)
                  .join(" ") || "Batchmate";
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onPick(c)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {fullName
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() ?? "")
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{fullName}</p>
                        {c.profession && (
                          <p className="text-xs text-gray-500 truncate">{c.profession}</p>
                        )}
                      </div>
                      <span className="text-xs text-orange-600 font-medium">+ Add</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
