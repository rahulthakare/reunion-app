"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/types/contact";

interface ContactFormProps {
  initial?: Partial<Contact>;
  contactId?: string;
}

export function ContactForm({ initial, contactId }: ContactFormProps) {
  const router = useRouter();
  const isEdit = Boolean(contactId);

  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    city: initial?.city ?? "",
    currentAddress: initial?.currentAddress ?? "",
    permanentAddress: initial?.permanentAddress ?? "",
    profession: initial?.profession ?? "",
    company: initial?.company ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    socialLink: initial?.socialLink ?? "",
    showContact: initial?.showContact ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const target = e.target;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit ? `/api/contacts/${contactId}` : "/api/contacts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save contact.");
      }

      router.push("/admin/directory");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save contact.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Name section */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 mb-2">Name</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Rajesh"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Kumar"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
        </div>
      </fieldset>

      {/* Address section */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 mb-2">Address</legend>
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
            placeholder="e.g. Nagpur"
            value={form.city}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">Short label used for sorting and filtering.</p>
        </div>
        <div>
          <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Current Address
          </label>
          <textarea
            id="currentAddress"
            name="currentAddress"
            rows={3}
            className="input-field resize-none"
            placeholder="Full current postal address"
            value={form.currentAddress}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Permanent Address <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="permanentAddress"
            name="permanentAddress"
            rows={3}
            className="input-field resize-none"
            placeholder="Family / permanent address"
            value={form.permanentAddress}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {/* Work section */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 mb-2">Work</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profession / Work Area
            </label>
            <input
              id="profession"
              name="profession"
              type="text"
              className="input-field"
              placeholder="e.g. Software Engineer"
              value={form.profession}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company / Employer
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className="input-field"
              placeholder="e.g. Infosys"
              value={form.company}
              onChange={handleChange}
            />
          </div>
        </div>
      </fieldset>

      {/* Contact section */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 mb-2">Contact</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input-field"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn / Facebook URL
          </label>
          <input
            id="socialLink"
            name="socialLink"
            type="url"
            className="input-field"
            placeholder="https://linkedin.com/in/…"
            value={form.socialLink}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {/* Privacy toggle */}
      <div className="flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-200 p-4">
        <input
          id="showContact"
          name="showContact"
          type="checkbox"
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 mt-0.5"
          checked={form.showContact}
          onChange={handleChange}
        />
        <div>
          <label htmlFor="showContact" className="text-sm font-medium text-gray-700">
            Show phone & email to other batchmates
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            If unchecked, name and address will still be visible but contact details will be hidden.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Contact"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/directory")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
