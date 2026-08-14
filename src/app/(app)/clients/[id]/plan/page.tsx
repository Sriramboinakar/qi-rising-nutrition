import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PlanForm } from "@/components/plan-form";
import { PlanActions } from "@/components/plan-actions";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { PLAN_STATUS_LABELS, PLAN_STATUS_TONES } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      plans: {
        orderBy: { updatedAt: "desc" },
        include: { meals: { orderBy: { mealOrder: "asc" } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      {client.plans.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No nutrition plans yet"
          description="Create the first plan to define macros and daily meals."
        />
      ) : (
        <div className="space-y-4">
          {client.plans.map((plan) => (
            <Card key={plan.id} className={plan.status === "ACTIVE" ? "border-brand-300 ring-1 ring-brand-200" : ""}>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    {plan.name}
                    <Badge tone={PLAN_STATUS_TONES[plan.status]}>
                      {PLAN_STATUS_LABELS[plan.status]}
                    </Badge>
                  </span>
                }
                subtitle={
                  plan.startDate || plan.endDate
                    ? `${plan.startDate ? formatDate(plan.startDate) : "?"} → ${plan.endDate ? formatDate(plan.endDate) : "ongoing"}`
                    : undefined
                }
                action={<PlanActions clientId={client.id} planId={plan.id} status={plan.status} />}
              />
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-5">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Calories</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{plan.calories ?? "—"} kcal</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Protein</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{plan.proteinG ?? "—"} g</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Carbs</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{plan.carbsG ?? "—"} g</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Fat</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">{plan.fatG ?? "—"} g</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Water</dt>
                  <dd className="mt-0.5 text-sm text-stone-800">
                    {plan.waterLiters !== null ? `${Number(plan.waterLiters)} L` : "—"}
                  </dd>
                </div>
              </dl>

              {plan.meals.length > 0 ? (
                <div className="border-t border-stone-100 px-5 py-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">Meals</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {plan.meals.map((meal) => (
                      <div key={meal.id} className="rounded-lg border border-stone-100 bg-stone-50 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-stone-800">
                            {meal.mealName}
                            {meal.timeOfDay ? <span className="ml-1 font-normal text-stone-400">· {meal.timeOfDay}</span> : null}
                          </p>
                          {meal.calories ? (
                            <span className="text-xs text-stone-500">{meal.calories} kcal</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-stone-600">{meal.foods}</p>
                        {(meal.proteinG || meal.carbsG || meal.fatG) && (
                          <p className="mt-1 text-xs text-stone-400">
                            P {meal.proteinG ?? "—"}g · C {meal.carbsG ?? "—"}g · F {meal.fatG ?? "—"}g
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {plan.supplements || plan.notes ? (
                <div className="border-t border-stone-100 px-5 py-4">
                  {plan.supplements ? (
                    <p className="text-sm text-stone-600">
                      <span className="font-medium text-stone-700">Supplements:</span> {plan.supplements}
                    </p>
                  ) : null}
                  {plan.notes ? (
                    <p className="mt-1 text-sm text-stone-600">
                      <span className="font-medium text-stone-700">Notes:</span> {plan.notes}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Create plan" subtitle="Add a new nutrition plan with daily macros and meals." />
        <div className="px-5 py-5">
          <PlanForm clientId={client.id} />
        </div>
      </Card>
    </div>
  );
}