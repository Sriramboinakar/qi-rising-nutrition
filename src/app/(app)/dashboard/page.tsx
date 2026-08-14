import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  Users,
  CalendarClock,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SEVERITY_TONE = { high: "red", medium: "amber", low: "blue" } as const;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const data = await getDashboardData(session.user.id, session.user.role === "SUPER_ADMIN");

  const stats = [
    {
      label: "Active clients",
      value: data.stats.activeCount,
      icon: Users,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Open follow-ups",
      value: data.stats.openFollowUps,
      icon: CalendarClock,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Overdue follow-ups",
      value: data.stats.overdueFollowUps,
      icon: AlertTriangle,
      accent: "bg-red-50 text-red-600",
    },
    {
      label: "Needs attention",
      value: data.attention.length,
      icon: Activity,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${session.user.name?.split(" ")[0] ?? "Coach"}`}
        description="Here is what needs your attention today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-stone-900">{stat.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="Needs attention"
              subtitle="Clients sorted by urgency, with the action required"
              action={
                <Link href="/clients">
                  <Button variant="ghost" size="sm">
                    All clients <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />
            <div className="divide-y divide-stone-100">
              {data.attention.length === 0 ? (
                <div className="px-5 py-10">
                  <EmptyState
                    icon={<CheckCircle2 className="h-10 w-10" />}
                    title="Everything is on track"
                    description="No clients currently need attention."
                  />
                </div>
              ) : (
                data.attention.map((item) => (
                  <Link
                    key={`${item.clientId}-${item.reason}`}
                    href={`/clients/${item.clientId}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-stone-900">{item.clientName}</p>
                        <Badge tone={SEVERITY_TONE[item.severity]}>{item.reason}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-stone-500">{item.detail}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-xs font-medium text-brand-700 sm:inline">
                        {item.action}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-stone-300" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Upcoming follow-ups" subtitle="Next 7 days" />
            <div className="divide-y divide-stone-100">
              {data.upcoming.length === 0 ? (
                <p className="px-5 py-6 text-sm text-stone-500">No follow-ups scheduled.</p>
              ) : (
                data.upcoming.map((f) => (
                  <Link
                    key={f.id}
                    href={`/clients/${f.clientId}/followups`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">{f.title}</p>
                      <p className="truncate text-xs text-stone-500">
                        {f.client?.firstName} {f.client?.lastName} — {formatDate(f.dueDate)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" subtitle="Latest changes across clients" />
            <div className="divide-y divide-stone-100">
              {data.recentActivity.length === 0 ? (
                <p className="px-5 py-6 text-sm text-stone-500">No activity yet.</p>
              ) : (
                data.recentActivity.map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <p className="text-sm text-stone-700">{a.message}</p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {a.client ? `${a.client.firstName} ${a.client.lastName} · ` : ""}
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}