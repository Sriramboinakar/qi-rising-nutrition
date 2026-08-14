import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { AssessmentForm } from "@/components/assessment-form";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { formatDate, formatNumber } from "@/lib/utils";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/labels";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { date: "desc" },
        include: { client: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      {client.assessments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No assessments yet"
          description="Record the initial assessment to establish a baseline."
        />
      ) : (
        <div className="space-y-4">
          {client.assessments.map((a) => (
            <Card key={a.id}>
              <CardHeader
                title={`${ASSESSMENT_TYPE_LABELS[a.type]} — ${formatDate(a.date)}`}
                action={
                  <Badge tone="neutral">{ASSESSMENT_TYPE_LABELS[a.type]}</Badge>
                }
              />
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Weight</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.weightKg))} kg</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Goal weight</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.goalWeightKg))} kg</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Body fat</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.bodyFatPct))}%</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Waist</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.waistCm))} cm</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Chest</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.chestCm))} cm</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Hips</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.hipsCm))} cm</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Arm</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.armCm))} cm</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Thigh</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{formatNumber(Number(a.thighCm))} cm</dd>
                </div>
              </dl>
              {a.goalSummary ? (
                <div className="border-t border-stone-100 px-5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Goal</p>
                  <p className="mt-1 text-sm text-stone-700">{a.goalSummary}</p>
                </div>
              ) : null}
              {a.medicalNotes || a.allergies || a.medications ? (
                <div className="border-t border-stone-100 px-5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Health notes</p>
                  <div className="mt-1 space-y-1 text-sm text-stone-700">
                    {a.medicalNotes ? <p>Medical: {a.medicalNotes}</p> : null}
                    {a.allergies ? <p>Allergies: {a.allergies}</p> : null}
                    {a.medications ? <p>Medications: {a.medications}</p> : null}
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Add assessment" subtitle="Record a new initial, follow-up, or review assessment." />
        <div className="px-5 py-5">
          <AssessmentForm clientId={client.id} />
        </div>
      </Card>
    </div>
  );
}