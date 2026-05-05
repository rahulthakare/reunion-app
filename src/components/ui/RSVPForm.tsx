"use client";

import { useState, type FormEvent } from "react";

interface RSVPData {
  name: string;
  phone: string;
  city: string;
  withFamily: boolean;
  familyCount: number;
  message: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function RSVPForm() {
  const [form, setForm] = useState<RSVPData>({
    name: "",
    phone: "",
    city: "",
    withFamily: false,
    familyCount: 1,
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "familyCount"
        ? Number(value)
        : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re registered!</h3>
        <p className="text-gray-500">
          Thank you, <strong>{form.name}</strong>! We&apos;ve got your RSVP.
          See you on <span className="text-indigo-600 font-semibold">13 June 2026</span>!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="text-center mb-2">
        <div className="text-4xl mb-2">🙋</div>
        <h2 className="text-2xl font-bold text-gray-900">Count Me In!</h2>
        <p className="text-gray-500 text-sm mt-1">
          Join us on <strong>Saturday, 13 June 2026</strong> at New English High School, Wardha
        </p>
      </div>

      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input-field"
          placeholder="Your name as in school records"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp / Mobile Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="input-field"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          Current City <span className="text-red-500">*</span>
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          className="input-field"
          placeholder="e.g. Nagpur, Mumbai, Pune…"
          value={form.city}
          onChange={handleChange}
        />
      </div>

      {/* With family */}
      <div className="flex items-center gap-3">
        <input
          id="withFamily"
          name="withFamily"
          type="checkbox"
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          checked={form.withFamily}
          onChange={handleChange}
        />
        <label htmlFor="withFamily" className="text-sm text-gray-700">
          I&apos;m coming with family
        </label>
      </div>

      {form.withFamily && (
        <div>
          <label htmlFor="familyCount" className="block text-sm font-medium text-gray-700 mb-1">
            Number of family members (including you)
          </label>
          <select
            id="familyCount"
            name="familyCount"
            className="input-field"
            value={form.familyCount}
            onChange={handleChange}
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          A message for your batchmates{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="input-field resize-none"
          placeholder="What are you most looking forward to?"
          value={form.message}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full"
      >
        {status === "loading" ? "Submitting…" : "Submit RSVP 🎉"}
      </button>
    </form>
  );
}
