import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge, Button, Card, CardHeader, EmptyState } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { NutritionSummary, type NutritionSummarySource } from "@/components/nutrition-summary";
import { NutritionTargetOverride } from "@/components/nutrition-target-override";
import { buildNutritionProfile } from "@/lib/nutrition";
import { formatDate, formatNumber } from "@/lib/utils";
import { FOLLOWUP_PRIORITY_LABELS, FOLLOWUP_PRIORITY_TONES, SEX_LABELS } from "@/lib/labels";
import { ClipboardList, MessageSquareText, CalendarClock, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      program: true,
      assessments: { orderBy: { date: "desc" }, take: 1 },
      checkIns: { orderBy: { checkInDate: "desc" }, take: 1 },
      followUps: {
        where: { status: "OPEN" },
        orderBy: { dueDate: "asc" },
        take: 5,
      },
      coachNotes: { orderBy: { createdAt: "desc" }, take: 3 },
      activities: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!client) notFound();

  const latestAssessment = client.assessments[0];
  const latestCheckIn = client.checkIns[0];

  const nutritionSource: NutritionSummarySource = {
    weightKg: latestAssessment?.weightKg !== null && latestAssessment?.weightKg !== undefined
      ? Number(latestAssessment.weightKg)
      : null,
    heightCm: latestAssessment?.heightCm ?? client.heightCm
      ? Number(latestAssessment?.heightCm ?? client.heightCm)
      : null,
    dateOfBirth: client.dateOfBirth,
    sex: client.sex,
    activityLevel: latestAssessment?.activityLevel ?? null,
    goal: client.category,
    calorieTarget: client.calorieTarget,
    proteinTargetG: client.proteinTargetG,
    carbsTargetG: client.carbsTargetG,
    fatTargetG: client.fatTargetG,
  };

  const nutritionProfile = buildNutritionProfile({
    weightKg: nutritionSource.weightKg,
    heightCm: nutritionSource.heightCm,
    dateOfBirth: nutritionSource.dateOfBirth,
    sex: nutritionSource.sex,
    activityLevel: nutritionSource.activityLevel,
    goal: nutritionSource.goal,
  });

  const details = [
    { label: "Email", value: client.email ?? "—" },
    { label: "Phone", value: client.phone ?? "—" },
    { label: "Sex", value: client.sex ? SEX_LABELS[client.sex] ?? client.sex : "—" },
    { label: "Date of birth", value: client.dateOfBirth ? formatDate(client.dateOfBirth) : "—" },
    { label: "Program", value: client.program?.name ?? "—" },
    { label: "Program start", value: client.programStartDate ? formatDate(client.programStartDate) : "—" },
    { label: "Program end", value: client.programEndDate ? formatDate(client.programEndDate) : "—" },
  ];

  return (
    <StaggerChildren stagger={0.06} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <NutritionSummary source={nutritionSource} />

        <div className="rounded-xl border border-stone-200">
          <NutritionTargetOverride
            clientId={client.id}
            current={{
              calories: client.calorieTarget,
              protein: client.proteinTargetG,
              carbs: client.carbsTargetG,
              fat: client.fatTargetG,
            }}
            calculated={{
              calories: nutritionProfile.calorieTarget,
              protein: nutritionProfile.proteinG,
              carbs: nutritionProfile.carbsG,
              fat: nutritionProfile.fatG,
            }}
          />
        </div>

        <Card>
          <CardHeader title="Client details" />
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">{d.label}</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{d.value}</dd>
              </div>
            ))}
          </dl>
          {client.notes ? (
            <div className="border-t border-stone-100 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Notes</p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-stone-700">{client.notes}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader
            title="Latest assessment"
            action={
              <Link href={`/clients/${client.id}/assessment`}>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          {latestAssessment ? (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Date</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatDate(latestAssessment.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Weight</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(latestAssessment.weightKg))} kg</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Goal weight</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(latestAssessment.goalWeightKg))} kg</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Body fat</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(latestAssessment.bodyFatPct))}%</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Waist</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(latestAssessment.waistCm))} cm</dd>
              </div>
            </dl>
          ) : (
            <div className="px-5 py-6">
              <EmptyState
                icon={<ClipboardList className="h-8 w-8" />}
                title="No assessment yet"
                description="Complete the initial assessment to record baseline metrics."
                action={
                  <Link href={`/clients/${client.id}/assessment`}>
                    <Button size="sm">Complete assessment</Button>
                  </Link>
                }
              />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Latest check-in"
            action={
              <Link href={`/clients/${client.id}/checkins`}>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          {latestCheckIn ? (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Week</dt>
                <dd className="mt-0.5 text-sm text-stone-800">#{latestCheckIn.weekNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Weight</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(latestCheckIn.weightKg))} kg</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Adherence</dt>
                <dd className="mt-0.5 text-sm text-stone-800">
                  {latestCheckIn.adherencePct !== null ? `${latestCheckIn.adherencePct}%` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Date</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{formatDate(latestCheckIn.checkInDate)}</dd>
              </div>
            </dl>
          ) : (
            <div className="px-5 py-6">
              <EmptyState
                icon={<MessageSquareText className="h-8 w-8" />}
                title="No check-ins yet"
                description="Record the first weekly check-in to start tracking progress."
                action={
                  <Link href={`/clients/${client.id}/checkins`}>
                    <Button size="sm">Add check-in</Button>
                  </Link>
                }
              />
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Open follow-ups"
            action={
              <Link href={`/clients/${client.id}/followups`}>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            }
          />
          <div className="divide-y divide-stone-100">
            {client.followUps.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">No open follow-ups.</p>
            ) : (
              client.followUps.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">{f.title}</p>
                    <p className="text-xs text-stone-500">Due {formatDate(f.dueDate)}</p>
                  </div>
                  <Badge tone={FOLLOWUP_PRIORITY_TONES[f.priority]}>
                    {FOLLOWUP_PRIORITY_LABELS[f.priority]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent notes" />
          <div className="divide-y divide-stone-100">
            {client.coachNotes.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">No notes yet.</p>
            ) : (
              client.coachNotes.map((n) => (
                <div key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-stone-900">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <div className="divide-y divide-stone-100">
            {client.activities.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">No activity yet.</p>
            ) : (
              client.activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
                  <div className="min-w-0">
                    <p className="text-sm text-stone-700">{a.message}</p>
                    <p className="text-xs text-stone-400">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {client.programEndDate ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader
              title="Program schedule"
              subtitle={
                <CalendarClock className="h-3.5 w-3.5" />
              }
            />
            <div className="px-5 py-4 text-sm text-amber-900">
              {client.program?.name} ends on {formatDate(client.programEndDate)}.
            </div>
          </Card>
        ) : null}
      </div>
    </StaggerChildren>
  );
}