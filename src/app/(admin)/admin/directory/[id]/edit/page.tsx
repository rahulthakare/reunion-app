import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";

// Don't try to pre-render at build time — this page hits Firestore at request time
export const dynamic = "force-dynamic";
import { ContactForm } from "@/components/features/ContactForm";
import { deriveContactFields, getDisplayName } from "@/lib/utils/contact";
import type { Contact } from "@/types/contact";

interface EditContactPageProps {
  params: { id: string };
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  let contact: Contact | null = null;

  try {
    const doc = await adminDb.doc(`contacts/${params.id}`).get();
    if (!doc.exists) notFound();
    contact = deriveContactFields({ id: doc.id, ...(doc.data() as Partial<Contact>) });
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Batchmate</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Update contact details for <strong>{getDisplayName(contact)}</strong>.
        </p>
      </div>
      <ContactForm initial={contact} contactId={params.id} />
    </div>
  );
}
