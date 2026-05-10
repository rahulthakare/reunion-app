"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Committee, CommitteeMember, CommitteeMemberRole } from "@/types/committee";
import { ROLE_LABEL, sortMembers } from "@/types/committee";
import { CommitteeMemberPicker } from "./CommitteeMemberPicker";

interface CommitteeMemberListProps {
  committee: Committee;
}

export function CommitteeMemberList({ committee }: CommitteeMemberListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const sorted = sortMembers(committee.members);

  async function changeRole(member: CommitteeMember, role: CommitteeMemberRole) {
    setBusyId(member.contactId);
    try {
      await fetch(`/api/committees/${committee.id}/members/${member.contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(member: CommitteeMember) {
    if (!confirm(`Remove ${member.name} from ${committee.name}?`)) return;
    setBusyId(member.contactId);
    try {
      await fetch(`/api/committees/${committee.id}/members/${member.contactId}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function addMember(contactId: string) {
    setAddError(null);
    setBusyId("__adding__");
    try {
      const res = await fetch(`/api/committees/${committee.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contactId, role: "member" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError(body.error || `Failed to add member (HTTP ${res.status})`);
        return;
      }
      setPickerOpen(false);
      router.refresh();
    } catch (e) {
      console.error("[addMember]", e);
      setAddError(e instanceof Error ? e.message : "Failed to add member.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          Members <span className="text-gray-400 font-normal">({sorted.length})</span>
        </h2>
        <button
          onClick={() => {
            setAddError(null);
            setPickerOpen(true);
          }}
          className="btn-primary text-sm"
        >
          + Add member
        </button>
      </div>

      {addError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm">
          ⚠️ {addError}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No members yet — add the first batchmate to get started.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sorted.map((m) => (
            <li key={m.contactId} className="py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                {m.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase() ?? "")
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-400">
                  Added {new Date(m.addedAt).toLocaleDateString()}
                </p>
              </div>
              <select
                value={m.role}
                onChange={(e) => changeRole(m, e.target.value as CommitteeMemberRole)}
                disabled={busyId === m.contactId}
                className="text-sm rounded-md border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-orange-400"
              >
                <option value="chair">{ROLE_LABEL.chair}</option>
                <option value="co-chair">{ROLE_LABEL["co-chair"]}</option>
                <option value="member">{ROLE_LABEL.member}</option>
              </select>
              <button
                onClick={() => removeMember(m)}
                disabled={busyId === m.contactId}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                title="Remove"
              >
                ✗
              </button>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <CommitteeMemberPicker
          excludeContactIds={sorted.map((m) => m.contactId)}
          onPick={(c) => addMember(c.id)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
