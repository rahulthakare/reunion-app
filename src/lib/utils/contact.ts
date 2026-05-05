import type { Contact } from "@/types/contact";

/**
 * Backward-compatibility helper. Given a raw Firestore record (which may have
 * been created before PLAN-006), derives missing firstName/lastName from `name`,
 * and falls back to `city` if `currentAddress` is missing.
 *
 * Returns a Contact with all derived fields populated.
 */
export function deriveContactFields(
  raw: Partial<Contact> & { id: string }
): Contact {
  let firstName = raw.firstName ?? "";
  let lastName = raw.lastName ?? "";

  if ((!firstName || !lastName) && raw.name) {
    const parts = raw.name.trim().split(/\s+/);
    if (!firstName) firstName = parts[0] ?? "";
    if (!lastName) lastName = parts.slice(1).join(" ");
  }

  const composedName = `${firstName} ${lastName}`.trim();
  const name = raw.name?.trim() || composedName;

  return {
    id: raw.id,
    firstName,
    lastName,
    name,
    city: raw.city ?? "",
    currentAddress: raw.currentAddress ?? raw.city ?? "",
    permanentAddress: raw.permanentAddress ?? "",
    profession: raw.profession ?? "",
    company: raw.company ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    socialLink: raw.socialLink ?? "",
    showContact: raw.showContact ?? true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Compose a Contact's display name from firstName + lastName, falling back to `name`.
 */
export function getDisplayName(contact: Pick<Contact, "firstName" | "lastName" | "name">): string {
  const composed = `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim();
  return composed || contact.name || "Unknown";
}
