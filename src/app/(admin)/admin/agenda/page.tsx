"use client";

import { useState, useEffect } from "react";
import type { AgendaItem } from "@/types/agenda";

const EMPTY_ITEM = (): AgendaItem => ({
  id: crypto.randomUUID(),
  time: "",
  title: "",
  description: "",
  order: 0,
});

type Status = "idle" | "loading" | "saving" | "saved" | "error";

export default function AdminAgendaPage() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/agenda")
      .then((r) => r.json())
      .then((data: { items?: AgendaItem[] }) => {
        setItems(data.items ?? []);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Failed to load agenda.");
      });
  }, []);

  function handleChange(id: string, field: keyof AgendaItem, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM(), order: prev.length }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function moveItem(id: string, direction: "up" | "down") {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item, i) => ({ ...item, order: i })) }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Failed to save agenda. Please try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Agenda</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Edit the reunion day schedule — changes are reflected on the public page instantly.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={status === "saving" || status === "loading"}
          className="btn-primary"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved!" : "Save Agenda"}
        </button>
      </div>

      {status === "error" && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      {status === "loading" ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          Loading agenda…
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="card text-center text-gray-400 py-10">
              No agenda items yet. Click &quot;Add Item&quot; to get started.
            </div>
          )}

          {items.map((item, idx) => (
            <div key={item.id} className="card flex gap-4 items-start">
              {/* Order controls */}
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => moveItem(item.id, "up")}
                  disabled={idx === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg leading-none"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg leading-none"
                  title="Move down"
                >
                  ▼
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 09:00 AM"
                    value={item.time}
                    onChange={(e) => handleChange(item.id, "time", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Welcome & Registration"
                    value={item.title}
                    onChange={(e) => handleChange(item.id, "title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Short description…"
                    value={item.description}
                    onChange={(e) => handleChange(item.id, "description", e.target.value)}
                  />
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors mt-1 text-lg"
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}

          <button onClick={addItem} className="btn-secondary w-full mt-2">
            + Add Agenda Item
          </button>
        </div>
      )}
    </div>
  );
}
