import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { ShareClientLink } from "@/components/share-client-link";
import { NewClientMenu } from "@/components/new-client-menu";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES, GOAL_CATEGORY_LABELS } from "@/lib/labels";
import { fullName, initials, formatDate } from "@/lib/utils";
import { Search, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const category = params.category ?? "";

  const clients = await prisma.client.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
      ...(category ? { category: category as never } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      category: true,
      status: true,
      program: { select: { name: true } },
      checkIns: { select: { checkInDate: true }, orderBy: { checkInDate: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StaggerChildren stagger={0.04} className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        action={<NewClientMenu />}
      />

      <Card className="p-4">
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" method="get">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input name="q" defaultValue={q} placeholder="Search name or email" className="pl-9" />
          </div>
          <Select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={category}>
            <option value="">All goals</option>
            {Object.entries(GOAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" size="md">
            <Search className="h-4 w-4" /> Filter
          </Button>
        </form>
      </Card>

      {clients.length === 0 ? (
        <EmptyState
          icon={<UserRound className="h-10 w-10" />}
          title="No clients found"
          description="Create your first client to get started."
          action={<NewClientMenu />}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
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
                      <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {initials(client.firstName, client.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900">{fullName(client.firstName, client.lastName)}</p>
                          {client.email ? (
                            <p className="truncate text-xs text-stone-400">{client.email}</p>
                          ) : null}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {GOAL_CATEGORY_LABELS[client.category] ?? client.category}
                    </td>
                    <td className="px-5 py-3 text-stone-600">{client.program?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-stone-600">
                      {client.checkIns[0] ? formatDate(client.checkIns[0].checkInDate) : "Never"}
                    </td>
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
        </Card>
      )}
    </StaggerChildren>
  );
}