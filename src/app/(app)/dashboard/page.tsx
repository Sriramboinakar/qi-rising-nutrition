import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import {
  getDashboardStats,
  getDashboardUpcoming,
} from "@/lib/queries/dashboard";
import { getDashboardAttention, type AttentionKind } from "@/lib/queries/attention";
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { Skeleton } from "@/components/skeleton";
import { CountUp } from "@/components/count-up";
import { SendCheckInLinkButton } from "@/components/send-checkin-link";
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

const KIND_META: Record<AttentionKind, { tone: "red" | "violet" | "amber" | "blue"; dot: string; label: string }> = {
  OVERDUE: { tone: "red", dot: "bg-red-500", label: "Overdue" },
  NEW_CHECKIN: { tone: "violet", dot: "bg-violet-500", label: "New check-in" },
  PLAN_EXPIRING: { tone: "amber", dot: "bg-orange-500", label: "Plan expiring" },
  DUE: { tone: "blue", dot: "bg-amber-400", label: "Due" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Active clients",
      value: stats.activeCount,
      icon: Users,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Open follow-ups",
      value: stats.openFollowUps,
      icon: CalendarClock,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Overdue follow-ups",
      value: stats.overdueFollowUps,
      icon: AlertTriangle,
      accent: "bg-red-50 text-red-600",
    },
  ];

  return (
    <StaggerChildren stagger={0.04} className="space-y-8">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${session.user.name?.split(" ")[0] ?? "Coach"}`}
        description="Here is what needs your attention today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5 transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">{stat.label}</p>
                <CountUp
                  value={stat.value}
                  className="mt-1 inline-block text-3xl font-semibold tracking-tight text-stone-900 tabular-nums"
                />
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}

        <Suspense
          fallback={
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Needs attention</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">…</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </Card>
          }
        >
          <AttentionCountCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <AttentionSection />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-44 rounded-xl" />}>
            <UpcomingSection />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-44 rounded-xl" />}>
            <ActivitySection />
          </Suspense>
        </div>
      </div>
    </StaggerChildren>
  );
}

async function AttentionCountCard() {
  const attention = await getDashboardAttention();

  return (
    <Card className="p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">Needs attention</p>
          <CountUp
            value={attention.length}
            className="mt-1 inline-block text-3xl font-semibold tracking-tight text-stone-900 tabular-nums"
          />
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Activity className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

async function AttentionSection() {
  const attention = await getDashboardAttention();

  return (
    <Card>
      <CardHeader
        title="Needs attention"
        subtitle={
          attention.length === 0
            ? "No clients need action"
            : `${attention.length} client${attention.length === 1 ? "" : "s"} need attention`
        }
        action={
          <Link href="/clients">
            <Button variant="ghost" size="sm">
              All clients <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />
      <div className="divide-y divide-stone-100">
        {attention.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState
              icon={<CheckCircle2 className="h-10 w-10" />}
              title="Everything is on track"
              description="No clients currently need attention."
            />
          </div>
        ) : (
          attention.map((item) => {
            const meta = KIND_META[item.kind];
            return (
              <div
                key={`${item.clientId}-${item.kind}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-stone-900">{item.clientName}</p>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-stone-500">{item.detail}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.kind === "NEW_CHECKIN" ? (
                    <Link href={`/clients/${item.clientId}/checkins`}>
                      <Button variant="secondary" size="sm">
                        Review
                      </Button>
                    </Link>
                  ) : null}
                  {item.kind === "PLAN_EXPIRING" ? (
                    <Link href={`/clients/${item.clientId}/plan`}>
                      <Button variant="secondary" size="sm">
                        Renew plan
                      </Button>
                    </Link>
                  ) : null}
                  {item.canSendLink ? (
                    <SendCheckInLinkButton clientId={item.clientId} />
                  ) : null}
                  <Link href={`/clients/${item.clientId}`}>
                    <Button variant="ghost" size="sm">
                      View client <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

async function UpcomingSection() {
  const { upcoming } = await getDashboardUpcoming();

  return (
    <Card>
      <CardHeader title="Upcoming follow-ups" subtitle="Next 7 days" />
      <div className="divide-y divide-stone-100">
        {upcoming.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-500">No follow-ups scheduled.</p>
        ) : (
          upcoming.map((f) => (
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
  );
}

async function ActivitySection() {
  const { recentActivity } = await getDashboardUpcoming();

  return (
    <Card>
      <CardHeader title="Recent activity" subtitle="Latest changes across clients" />
      <div className="divide-y divide-stone-100">
        {recentActivity.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-500">No activity yet.</p>
        ) : (
          recentActivity.map((a) => (
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
  );
}