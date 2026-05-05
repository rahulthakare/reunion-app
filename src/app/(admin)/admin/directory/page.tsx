"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ContactListItem } from "@/types/contact";
import { getDisplayName } from "@/lib/utils/contact";

export default function AdminDirectoryPage() {
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      const data = (await res.json()) as { contacts?: ContactListItem[]; error?: string };
      if (data.error) throw new Error(data.error);
      setContacts(data.contacts ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete contact. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = search
    ? contacts.filter((c) => {
        const haystack = [c.firstName, c.lastName, c.name, c.city, c.currentAddress, c.profession]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : contacts;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batchmate Address Book</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage the contact directory for NEHS Wardha — Batch &apos;93.
          </p>
        </div>
        <Link href="/admin/directory/new" className="btn-primary">
          + Add Contact
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          className="input-field pl-9"
          placeholder="Search by name, city, address, profession…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          Loading contacts…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          {contacts.length === 0
            ? 'No contacts yet. Click "+ Add Contact" to get started.'
            : "No contacts match your search."}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Profession</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Visible</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((contact, idx) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{contact.firstName || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{contact.lastName || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{contact.city}</td>
                    <td className="px-4 py-3 text-gray-500">{contact.profession || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{contact.phone || "—"}</td>
                    <td className="px-4 py-3">
                      {contact.showContact ? (
                        <span className="text-green-600 text-xs font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/directory/${contact.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(contact.id, getDisplayName(contact))}
                          disabled={deleting === contact.id}
                          className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                        >
                          {deleting === contact.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
