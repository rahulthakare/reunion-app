import Link from "next/link";
import { CommitteeForm } from "@/components/features/CommitteeForm";

export default function NewCommitteePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Committee</h1>
          <p className="text-gray-500 mt-1">Add a new volunteer team.</p>
        </div>
        <Link href="/admin/committees" className="btn-secondary text-sm">
          ← Back
        </Link>
      </div>
      <CommitteeForm />
    </div>
  );
}
