import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { createHabit, toggleHabitLog } from "@/lib/actions/habits";
import { Button, Card, CardHeader, EmptyState, Input, Label, Select } from "@/components/ui";
import { HABIT_FREQUENCY_LABELS } from "@/lib/labels";
import { CheckCircle2, Repeat } from "lucide-react";
import { subDays, startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HabitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      habits: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        include: { logs: true },
      },
    },
  });

  if (!client) notFound();

  const days = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), 6 - i)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Add habit" subtitle="Track daily or weekly habits for this client." />
        <div className="px-5 py-5">
          <form
            action={async (fd: FormData) => {
              "use server";
              await createHabit(id, fd);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="w-56">
              <Label htmlFor="name">Habit name</Label>
              <Input id="name" name="name" required placeholder="e.g. 10k steps" />
            </div>
            <div className="w-40">
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" name="frequency" defaultValue="DAILY">
                {Object.entries(HABIT_FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Add habit</Button>
          </form>
        </div>
      </Card>

      {client.habits.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-10 w-10" />}
          title="No habits yet"
          description="Add habits to track consistency over time."
        />
      ) : (
        <Card>
          <CardHeader title="Habits" subtitle="Last 7 days" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Habit</th>
                  <th className="px-3 py-3 font-medium">Frequency</th>
                  {days.map((day) => (
                    <th key={day.toISOString()} className="px-2 py-3 text-center font-medium">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                      <span className="block text-[10px] font-normal text-stone-300">
                        {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 font-medium">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {client.habits.map((habit) => {
                  const logDates = new Set(habit.logs.map((l) => startOfDay(l.date).toISOString()));
                  const streak = days.reduce((acc, day) => {
                    if (acc.started) return acc;
                    if (logDates.has(day.toISOString())) {
                      acc.count += 1;
                    } else {
                      acc.started = true;
                    }
                    return acc;
                  }, { count: 0, started: false }).count;

                  return (
                    <tr key={habit.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-900">{habit.name}</p>
                      </td>
                      <td className="px-3 py-3 text-stone-600">
                        {HABIT_FREQUENCY_LABELS[habit.frequency]}
                      </td>
                      {days.map((day) => {
                        const done = logDates.has(day.toISOString());
                        return (
                          <td key={day.toISOString()} className="px-2 py-3 text-center">
                            <form
                              action={async () => {
                                "use server";
                                await toggleHabitLog(habit.id, client.id, day.toISOString());
                              }}
                            >
                              <button
                                type="submit"
                                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                                  done
                                    ? "border-brand-600 bg-brand-600 text-white"
                                    : "border-stone-300 bg-white text-transparent hover:border-brand-400"
                                }`}
                                aria-label={`Toggle ${habit.name} for ${day.toLocaleDateString()}`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            </form>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-stone-700">{streak}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}