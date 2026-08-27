"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bulkDeleteClients } from "@/lib/actions/clients";
import { isTestClientEmail } from "@/lib/test-data";
import { Badge, Button } from "@/components/ui";
import { PortalModal } from "@/components/portal-modal";
import { ShareClientLink } from "@/components/share-client-link";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES, GOAL_CATEGORY_LABELS } from "@/lib/labels";
import { fullName, initials } from "@/lib/utils";
import { Trash2, ShieldAlert } from "lucide-react";

export type ClientRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  category: string;
  status: string;
  programName: string | null;
  lastCheckInLabel: string;
};

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCount = clients.filter((c) => isTestClientEmail(c.email)).length;
  const allChecked = clients.length > 0 && selected.size === clients.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(clients.map((c) => c.id)));
  }

  function selectTest() {
    setSelected(new Set(clients.filter((c) => isTestClientEmail(c.email)).map((c) => c.id)));
  }

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await bulkDeleteClients([...selected]);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {selected.size > 0 || testCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-amber-50/60 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <span className="font-medium">{selected.size} selected</span>
            {testCount > 0 ? (
              <span className="text-xs text-amber-700">
                · {testCount} look{testCount === 1 ? "s" : ""} like test data
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectTest}>
              <ShieldAlert className="h-3.5 w-3.5" /> Select test/demo
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete selected
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all clients"
                  className="h-4 w-4 cursor-pointer accent-emerald-600"
                />
              </th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Goal</th>
              <th className="px-5 py-3 font-medium">Program</th>
              <th className="px-5 py-3 font-medium">Last check-in</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Share intake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-stone-50">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(client.id)}
                    onChange={() => toggle(client.id)}
                    aria-label={`Select ${fullName(client.firstName, client.lastName)}`}
                    className="h-4 w-4 cursor-pointer accent-emerald-600"
                  />
                </td>
                <td className="px-5 py-3">
                  <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                      {initials(client.firstName, client.lastName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900">{fullName(client.firstName, client.lastName)}</p>
                      {client.email ? <p className="truncate text-xs text-stone-400">{client.email}</p> : null}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-stone-600">
                  {GOAL_CATEGORY_LABELS[client.category] ?? client.category}
                </td>
                <td className="px-5 py-3 text-stone-600">{client.programName ?? "—"}</td>
                <td className="px-5 py-3 text-stone-600">{client.lastCheckInLabel}</td>
                <td className="px-5 py-3">
                  <Badge tone={CLIENT_STATUS_TONES[client.status]}>
                    {CLIENT_STATUS_LABELS[client.status]}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <ShareClientLink clientId={client.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PortalModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete clients"
        subtitle="This permanently removes the selected clients and ALL of their data — assessments, plans, check-ins and links. It cannot be undone."
      >
        <p className="text-sm text-stone-600">
          You are about to delete{" "}
          <span className="font-semibold text-stone-900">
            {selected.size} client{selected.size === 1 ? "" : "s"}
          </span>
          .
        </p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex items-center gap-2">
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete forever"}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
        </div>
      </PortalModal>
    </div>
  );
}