import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveAccessToken } from "@/lib/access-token";
import { ClientPortalShell } from "@/components/client-portal-shell";
import { PlanPrintButton } from "@/components/plan-print-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Nutrition Plan",
};

export default async function ClientPlanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const clientId = await resolveAccessToken(token, "PLAN");
  if (!clientId) notFound();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      firstName: true,
      plans: {
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { meals: { orderBy: { mealOrder: "asc" } } },
      },
    },
  });
  if (!client) notFound();

  const plan = client.plans[0];

  return (
    <ClientPortalShell
      title="My nutrition plan"
      subtitle={plan ? `Plan: ${plan.name}` : "No active plan yet"}
    >
      {!plan ? (
        <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Your nutrition plan is not available yet. Your coach will update it soon.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-end">
            <PlanPrintButton />
          </div>

          {plan.calories || plan.proteinG || plan.carbsG || plan.fatG ? (
            <div className="grid grid-cols-4 gap-3 rounded-xl bg-stone-50 p-4 text-center">
              {plan.calories !== null ? (
                <div>
                  <p className="text-lg font-semibold text-stone-900">{plan.calories}</p>
                  <p className="text-xs text-stone-500">kcal</p>
                </div>
              ) : null}
              {plan.proteinG !== null ? (
                <div>
                  <p className="text-lg font-semibold text-stone-900">{plan.proteinG}g</p>
                  <p className="text-xs text-stone-500">Protein</p>
                </div>
              ) : null}
              {plan.carbsG !== null ? (
                <div>
                  <p className="text-lg font-semibold text-stone-900">{plan.carbsG}g</p>
                  <p className="text-xs text-stone-500">Carbs</p>
                </div>
              ) : null}
              {plan.fatG !== null ? (
                <div>
                  <p className="text-lg font-semibold text-stone-900">{plan.fatG}g</p>
                  <p className="text-xs text-stone-500">Fat</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {plan.waterLiters !== null ? (
            <p className="text-sm text-stone-600">Daily water target: {Number(plan.waterLiters)} L</p>
          ) : null}

          {plan.meals.length > 0 ? (
            <div className="space-y-3">
              {plan.meals.map((meal) => (
                <div key={meal.id} className="break-inside-avoid rounded-xl border border-stone-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-stone-900">{meal.mealName}</p>
                    {meal.calories !== null ? (
                      <p className="text-xs text-stone-500">{meal.calories} kcal</p>
                    ) : null}
                  </div>
                  {meal.timeOfDay ? (
                    <p className="text-xs text-stone-400">{meal.timeOfDay}</p>
                  ) : null}
                  <p className="mt-2 text-sm whitespace-pre-wrap text-stone-700">{meal.foods}</p>
                </div>
              ))}
            </div>
          ) : null}

          {plan.supplements ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Supplements</p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-stone-700">{plan.supplements}</p>
            </div>
          ) : null}

          {plan.startDate || plan.endDate ? (
            <p className="text-xs text-stone-500">
              {plan.startDate ? `From ${formatDate(plan.startDate)}` : ""}
              {plan.startDate && plan.endDate ? " to " : ""}
              {plan.endDate ? formatDate(plan.endDate) : ""}
            </p>
          ) : null}
        </div>
      )}
    </ClientPortalShell>
  );
}