import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/checkin-form";
import { CheckInRow } from "@/components/checkin-row";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { MessageSquareText } from "lucide-react";
import { markCheckInMissed } from "@/lib/actions/checkins";

export const dynamic = "force-dynamic";

export default async function CheckInsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      checkIns: { orderBy: { weekNumber: "desc" } },
    },
  });

  if (!client) notFound();

  const nextWeek =
    client.checkIns.length > 0 ? Math.max(...client.checkIns.map((c) => c.weekNumber)) + 1 : 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Record weekly check-in" subtitle={`Next expected week: ${nextWeek}`} />
        <div className="px-5 py-5">
          <CheckInForm clientId={client.id} nextWeek={nextWeek} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Check-in history" subtitle={`${client.checkIns.length} recorded`} />
        {client.checkIns.length === 0 ? (
          <div className="px-5 py-6">
            <EmptyState
              icon={<MessageSquareText className="h-8 w-8" />}
              title="No check-ins yet"
              description="Record the first weekly check-in above."
            />
          </div>
        ) : (
          client.checkIns.map((c) => (
            <CheckInRow
              key={c.id}
              clientId={client.id}
              checkIn={{
                id: c.id,
                weekNumber: c.weekNumber,
                checkInDate: c.checkInDate.toISOString(),
                status: c.status,
                weightKg: c.weightKg !== null ? c.weightKg.toString() : null,
                waistCm: c.waistCm !== null ? c.waistCm.toString() : null,
                sleepHours: c.sleepHours !== null ? c.sleepHours.toString() : null,
                energyLevel: c.energyLevel,
                mood: c.mood,
                adherencePct: c.adherencePct,
                waterLiters: c.waterLiters !== null ? c.waterLiters.toString() : null,
                notes: c.notes,
                response: c.response,
                followUpDate: c.followUpDate ? c.followUpDate.toISOString() : null,
              }}
            />
          ))
        )}
      </Card>

      <Card>
        <CardHeader
          title="Missed week"
          subtitle="Mark the current week as missed if the client did not check in."
        />
        <div className="px-5 py-4">
          <form
            action={async () => {
              "use server";
              await markCheckInMissed(id, nextWeek);
            }}
          >
            <Badge tone="amber">Week {nextWeek}</Badge>
            <button
              type="submit"
              className="mt-2 inline-flex h-8 items-center rounded-lg bg-stone-900 px-3 text-xs font-medium text-white transition-colors hover:bg-stone-800 cursor-pointer"
            >
              Mark week {nextWeek} as missed
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}