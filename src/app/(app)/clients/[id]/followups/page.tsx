import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { createFollowUp, completeFollowUp, deleteFollowUp } from "@/lib/actions/followups";
import { Badge, Button, Card, CardHeader, Input, Label, Select } from "@/components/ui";
import { FOLLOWUP_PRIORITY_LABELS, FOLLOWUP_PRIORITY_TONES, FOLLOWUP_STATUS_LABELS, FOLLOWUP_STATUS_TONES } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { Check, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
    },
  });

  if (!client) notFound();

  const open = client.followUps.filter((f) => f.status === "OPEN");
  const completed = client.followUps.filter((f) => f.status !== "OPEN");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Schedule follow-up" subtitle="Set a reminder for a specific action or touchpoint." />
        <div className="px-5 py-5">
          <form
            action={async (fd: FormData) => {
              "use server";
              await createFollowUp(id, fd);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Check in on meal prep" />
              </div>
              <div>
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" name="priority" defaultValue="MEDIUM">
                  {Object.entries(FOLLOWUP_PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Optional details" />
              </div>
            </div>
            <Button type="submit">Schedule follow-up</Button>
          </form>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Open" subtitle={`${open.length} pending`} />
          {open.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-500">No open follow-ups. </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {open.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-stone-900">{f.title}</p>
                      <Badge tone={FOLLOWUP_PRIORITY_TONES[f.priority]}>
                        {FOLLOWUP_PRIORITY_LABELS[f.priority]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Due {formatDate(f.dueDate)}
                      {f.description ? ` · ${f.description}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <form
                      action={async () => {
                        "use server";
                        await completeFollowUp(f.id, id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-brand-50 hover:text-brand-600 cursor-pointer"
                        aria-label="Complete follow-up"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteFollowUp(f.id, id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        aria-label="Delete follow-up"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Completed" subtitle={`${completed.length} resolved`} />
          {completed.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-500">No completed follow-ups.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {completed.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 px-5 py-4 opacity-70">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-700 line-through">{f.title}</p>
                    <p className="text-xs text-stone-400">
                      {FOLLOWUP_STATUS_LABELS[f.status]}
                      {f.completedAt ? ` · ${formatDate(f.completedAt)}` : ""}
                    </p>
                  </div>
                  <Badge tone={FOLLOWUP_STATUS_TONES[f.status]}>
                    {FOLLOWUP_STATUS_LABELS[f.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}