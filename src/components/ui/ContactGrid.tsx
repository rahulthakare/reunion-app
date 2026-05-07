"use client";

import { useState, useMemo } from "react";
import { ContactCard } from "./ContactCard";
import type { ContactListItem } from "@/types/contact";

const PAGE_SIZE = 24;

type SortKey = "name-asc" | "name-desc" | "city" | "recent";

interface ContactGridProps {
  contacts: ContactListItem[];
}

export function ContactGrid({ contacts }: ContactGridProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = q
      ? contacts.filter((c) => {
          const haystack = [
            c.firstName,
            c.lastName,
            c.name,
            c.city,
            c.salutation,
            c.presentAddress,
            c.currentAddress, // legacy fallback for older records
            c.permanentAddress,
            c.profession,
            c.company,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : [...contacts];

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => {
          const byLast = (a.lastName ?? "").localeCompare(b.lastName ?? "");
          return byLast !== 0 ? byLast : (a.firstName ?? "").localeCompare(b.firstName ?? "");
        });
        break;
      case "name-desc":
        result.sort((a, b) => {
          const byLast = (b.lastName ?? "").localeCompare(a.lastName ?? "");
          return byLast !== 0 ? byLast : (b.firstName ?? "").localeCompare(a.firstName ?? "");
        });
        break;
      case "city":
        result.sort((a, b) => a.city.localeCompare(b.city));
        break;
      case "recent":
        result.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        break;
    }
    return result;
  }, [contacts, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSort(value: SortKey) {
    setSort(value);
    setPage(1);
  }

  return (
    <div>
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by name, city, address, profession…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-56"
          value={sort}
          onChange={(e) => handleSort(e.target.value as SortKey)}
        >
          <option value="name-asc">Last Name A → Z</option>
          <option value="name-desc">Last Name Z → A</option>
          <option value="city">City</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length === 0
          ? "No batchmates found."
          : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
              currentPage * PAGE_SIZE,
              filtered.length
            )} of ${filtered.length} batchmates`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No batchmates match your search.</p>
          <button
            onClick={() => handleSearch("")}
            className="btn-secondary mt-4 text-sm"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-40 px-3 py-1.5 text-sm"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-40 px-3 py-1.5 text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
