export interface Contact {
  id: string;
  // Name fields (firstName/lastName preferred; `name` is a convenience full-name)
  salutation?: string;           // Honorific (Mr./Mrs./Dr./Adv./Shri/Smt etc.)
  firstName: string;
  lastName: string;
  name: string; // computed: `${firstName} ${lastName}`.trim()

  // Address
  city: string;                  // short label, used for sort/filter
  presentAddress?: string;       // current/temporary address (where they live now)
  permanentAddress?: string;     // family / native / permanent address
  /** @deprecated use presentAddress — kept for backward compatibility */
  currentAddress?: string;

  // Work
  profession?: string;
  company?: string;

  // Contact (sensitive — gated by showContact)
  phone?: string;
  email?: string;

  // Other
  socialLink?: string;
  showContact: boolean;          // opt-in to expose phone/email
  createdAt?: string;
  updatedAt?: string;
}

// What the API returns to authenticated users — phone/email may be omitted
export type ContactListItem = Omit<Contact, "phone" | "email"> & {
  phone?: string;
  email?: string;
};
