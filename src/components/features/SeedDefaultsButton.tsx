"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SeedDefaultsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function seed() {
    if (!confirm("Create 10 default committees (Welcome, Food, Cultural, etc.)?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/committees/seed", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to seed committees.");
        return;
      }
      alert(
        `Created ${data.createdCount} committee(s). ${data.skippedCount} already existed.`
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={seed} disabled={busy} className="btn-secondary text-sm">
      {busy ? "Seeding…" : "🌱 Seed defaults"}
    </button>
  );
}
