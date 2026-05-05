import { ContactForm } from "@/components/features/ContactForm";

export default function NewContactPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Batchmate</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Add a new contact to the NEHS Wardha — Batch &apos;93 address book.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
