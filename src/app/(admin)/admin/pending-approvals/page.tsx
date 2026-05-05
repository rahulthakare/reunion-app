import { adminDb } from "@/lib/firebase/admin";
import type { PendingApproval } from "@/types/pending-approval";
import { PendingApprovalsTable } from "@/components/features/PendingApprovalsTable";

export const dynamic = "force-dynamic";

async function getPendingApprovals(): Promise<PendingApproval[]> {
  try {
    const snap = await adminDb
      .collection("pending_approvals")
      .orderBy("requestedAt", "desc")
      .get();
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<PendingApproval, "uid">),
      uid: d.id,
    }));
  } catch (err) {
    console.error("[admin/pending-approvals] failed to load:", err);
    return [];
  }
}

export default async function PendingApprovalsPage() {
  const items = await getPendingApprovals();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-500 mt-1 text-sm">
          People who have signed up but their email isn&apos;t in the address book yet.
          Approve them to grant access; reject to remove their request (they can re-attempt later).
        </p>
      </div>

      <div className="card">
        <PendingApprovalsTable initial={items} />
      </div>
    </div>
  );
}
