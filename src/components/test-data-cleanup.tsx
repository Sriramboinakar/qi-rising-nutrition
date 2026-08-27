"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTestClients, bulkDeleteClients } from "@/lib/actions/clients";
import { Button } from "@/components/ui";
import { PortalModal } from "@/components/portal-modal";
import { formatDate } from "@/lib/utils";
import { Trash2, Sparkles } from "lucide-react";

type TestClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  createdAt: Date;
  _count: { assessments: number; checkIns: number; plans: number };
};

export function TestDataCleanup() {
  const router = useRouter();
  const [clients, setClients] = useState<TestClient[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setClients(await getTestClients());
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!clients || clients.length === 0) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await bulkDeleteClients(clients.map((c) => c.id));
      if (res?.error) {
        setError(res.error);
        return;
      }
      setConfirmOpen(false);
      setClients([]);
      router.refresh();
    } catch {
      setError("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-900">Test &amp; demo data</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Clients created during testing use reserved email domains
            (@qirising.test, @example.com, @test.local). Remove them in one tap.
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={!clients || clients.length === 0 || deleting}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete all test clients
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-stone-400">Scanning for test data...</p>
        ) : !clients || clients.length === 0 ? (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <Sparkles className="h-4 w-4" /> No test clients found — your data is clean.
          </p>
        ) : (
          <>
            <p className="text-sm text-stone-600">
              Found <span className="font-semibold text-stone-900">{clients.length}</span> test
              client{clients.length === 1 ? "" : "s"}:
            </p>
            <ul className="mt-2 max-h-64 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-100">
              {clients.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-stone-700">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="truncate text-xs text-stone-400">{c.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">
                    added {formatDate(c.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <PortalModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete all test clients"
        subtitle="This permanently removes every detected test/demo client and all of their data. It cannot be undone."
      >
        <p className="text-sm text-stone-600">
          You are about to delete{" "}
          <span className="font-semibold text-stone-900">
            {clients?.length ?? 0} client{(clients?.length ?? 0) === 1 ? "" : "s"}
          </span>{" "}
          that were flagged as test data.
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