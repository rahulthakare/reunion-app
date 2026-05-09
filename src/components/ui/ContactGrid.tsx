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
      {/* Search + Sort bar — sits inside a soft frosted card so it doesn't
          look like floating form controls on the page background. */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
            placeholder="Search by name, city, address, profession…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>
        <select
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition sm:w-56"
          value={sort}
          onChange={(e) => handleSort(e.target.value as SortKey)}
        >
          <option value="name-asc">Last Name A → Z</option>
          <option value="name-desc">Last Name Z → A</option>
          <option value="city">City</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {/* Results count + active search chip */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          {filtered.length === 0
            ? "No batchmates found."
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                currentPage * PAGE_SIZE,
                filtered.length
              )} of ${filtered.length} batchmate${filtered.length === 1 ? "" : "s"}`}
        </p>
        {search && (
          <span className="pill-brand">
            🔎 “{search}”
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-accent-50/40 rounded-3xl border border-amber-100">
          <p className="text-5xl mb-3 inline-block animate-float-med">🔍</p>
          <p className="text-gray-700 font-semibold heading-display">
            No batchmates match your search.
          </p>
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
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all min-w-[36px] ${
                p === currentPage
                  ? "bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-glow"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
