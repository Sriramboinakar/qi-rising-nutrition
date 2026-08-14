import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { Skeleton } from "@/components/skeleton";
import { CLIENT_STATUS_LABELS, GOAL_CATEGORY_LABELS } from "@/lib/labels";
import { subMonths, startOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [statusGroups, totalClients, overdueCount] = await Promise.all([
    prisma.client.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.client.count(),
    prisma.followUp.count({ where: { status: "OPEN", dueDate: { lt: new Date() } } }),
  ]);

  const activeCount = statusGroups.find((g) => g.status === "ACTIVE")?._count._all ?? 0;

  return (
    <StaggerChildren stagger={0.05} className="space-y-6">
      <PageHeader title="Reports" description="High-level insights across all clients." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 transition-shadow duration-200 hover:shadow-md">
          <p className="text-sm text-stone-500">Total clients</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">{totalClients}</p>
        </Card>
        <Card className="p-5 transition-shadow duration-200 hover:shadow-md">
          <p className="text-sm text-stone-500">Active clients</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">{activeCount}</p>
        </Card>
        <Suspense
          fallback={
            <Card className="p-5">
              <p className="text-sm text-stone-500">Avg adherence (recent)</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">…</p>
            </Card>
          }
        >
          <AdherenceCard />
        </Suspense>
        <Card className="p-5 transition-shadow duration-200 hover:shadow-md">
          <p className="text-sm text-stone-500">Overdue follow-ups</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">{overdueCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
          <GrowthCard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
          <StatusCard statusGroups={statusGroups} totalClients={totalClients} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}>
          <GoalCard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}>
          <ProgramCard />
        </Suspense>
      </div>
    </StaggerChildren>
  );
}

async function AdherenceCard() {
  const latestCheckIns = await prisma.checkIn.findMany({
    where: { adherencePct: { not: null } },
    select: { adherencePct: true },
    orderBy: { checkInDate: "desc" },
    take: 100,
  });
  const avg =
    latestCheckIns.length > 0
      ? Math.round(latestCheckIns.reduce((acc, c) => acc + Number(c.adherencePct), 0) / latestCheckIns.length)
      : null;

  return (
    <Card className="p-5 transition-shadow duration-200 hover:shadow-md">
      <p className="text-sm text-stone-500">Avg adherence (recent)</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
        {avg !== null ? `${avg}%` : "—"}
      </p>
    </Card>
  );
}

async function GrowthCard() {
  const monthsGrowth = await prisma.client.groupBy({
    by: ["createdAt"],
    orderBy: { createdAt: "asc" },
    _count: { _all: true },
  });

  const sixMonths = Array.from({ length: 6 }, (_, i) => {
    const month = startOfMonth(subMonths(new Date(), i));
    return { label: month.toLocaleDateString("en-US", { month: "short" }), count: 0 };
  }).reverse();

  const countByMonth = new Map<string, number>();
  for (const row of monthsGrowth) {
    const key = row.createdAt.toISOString().slice(0, 7);
    countByMonth.set(key, (countByMonth.get(key) ?? 0) + row._count._all);
  }
  const monthKeys = sixMonths.map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return d.toISOString().slice(0, 7);
  });
  sixMonths.forEach((m, i) => {
    m.count = countByMonth.get(monthKeys[i]) ?? 0;
  });

  const maxMonthCount = Math.max(...sixMonths.map((m) => m.count), 1);

  return (
    <Card>
      <CardHeader title="Client growth" subtitle="New clients per month (last 6 months)" />
      <div className="flex items-end gap-3 px-5 py-6" style={{ height: 180 }}>
        {sixMonths.map((m, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium text-stone-600">{m.count}</span>
            <div
              className="w-full rounded-t-lg bg-brand-500 transition-all"
              style={{ height: `${Math.max((m.count / maxMonthCount) * 120, m.count > 0 ? 8 : 2)}px` }}
            />
            <span className="text-[10px] text-stone-400">{m.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function StatusCard({
  statusGroups,
  totalClients,
}: {
  statusGroups: { status: string; _count: { _all: number } }[];
  totalClients: number;
}) {
  return (
    <Card>
      <CardHeader title="Clients by status" />
      <div className="space-y-3 px-5 py-5">
        {Object.keys(CLIENT_STATUS_LABELS).map((status) => {
          const count = statusGroups.find((g) => g.status === status)?._count._all ?? 0;
          const pct = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
          return (
            <div key={status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-stone-700">{CLIENT_STATUS_LABELS[status]}</span>
                <span className="text-stone-500">{count} ({pct}%)</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

async function GoalCard() {
  const categoryGroups = await prisma.client.groupBy({ by: ["category"], _count: { _all: true } });

  return (
    <Card>
      <CardHeader title="Clients by goal" />
      <div className="flex flex-wrap gap-2 px-5 py-5">
        {categoryGroups.map((g) => (
          <Link key={g.category} href={`/clients?category=${g.category}`}>
            <Badge tone="blue" className="cursor-pointer py-1.5">
              {GOAL_CATEGORY_LABELS[g.category] ?? g.category} · {g._count._all}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}

async function ProgramCard() {
  const programGroups = await prisma.program.findMany({
    include: { _count: { select: { clients: true } } },
    orderBy: { name: "asc" },
  });
  const totalForPrograms = programGroups.reduce((acc, p) => acc + p._count.clients, 0);

  return (
    <Card>
      <CardHeader title="Clients by program" />
      <div className="space-y-3 px-5 py-5">
        {programGroups.length === 0 ? (
          <p className="text-sm text-stone-500">No programs yet.</p>
        ) : (
          programGroups.map((p) => {
            const count = p._count.clients;
            const pct = totalForPrograms > 0 ? Math.round((count / totalForPrograms) * 100) : 0;
            return (
              <div key={p.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{p.name}</span>
                  <span className="text-stone-500">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-stone-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}