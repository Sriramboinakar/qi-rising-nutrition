import { prisma } from "@/lib/db";
import { Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { NewClientMenu } from "@/components/new-client-menu";
import { ClientsTable, type ClientRow } from "@/components/clients-table";
import { GOAL_CATEGORY_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
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
      phone: true,
      category: true,
      status: true,
      program: { select: { name: true } },
      checkIns: { select: { checkInDate: true }, orderBy: { checkInDate: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: ClientRow[] = clients.map((client) => ({
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    category: client.category,
    status: client.status,
    programName: client.program?.name ?? null,
    lastCheckInLabel: client.checkIns[0] ? formatDate(client.checkIns[0].checkInDate) : "Never",
  }));

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
            {Object.entries({
              ACTIVE: "Active",
              PAUSED: "Paused",
              COMPLETED: "Completed",
              INACTIVE: "Inactive",
            }).map(([value, label]) => (
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
          <ClientsTable clients={rows} />
        </Card>
      )}
    </StaggerChildren>
  );
}