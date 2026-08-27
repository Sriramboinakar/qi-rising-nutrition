"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/count-up";
import type { DashboardNutritionSnapshot } from "@/lib/queries/dashboard";

const EASE = [0.22, 1, 0.36, 1] as const;

type Macro = {
  label: string;
  hint: string;
  value: number | null;
  bar: string;
};

function BarRow({
  name,
  value,
  unit,
  pct,
  barClass,
  hint,
}: {
  name: string;
  value: number | null;
  unit: string;
  pct: number;
  barClass: string;
  hint?: string;
}) {
  return (
    <li className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-white/60">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium text-stone-700">{name}</span>
        <span className="shrink-0 tabular-nums text-stone-600">
          {value !== null ? `${value} ${unit}` : "—"}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </li>
  );
}

function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_1px_2px_rgb(0,0,0,0.04),0_12px_32px_-16px_rgb(0,0,0,0.14)] backdrop-blur-xl transition-colors hover:border-brand-200">
      <header className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function DailyAvgCard({ snapshot }: { snapshot: DashboardNutritionSnapshot }) {
  const macros: Macro[] = [
    { label: "Protein", hint: "for muscle & recovery", value: snapshot.avgProtein, bar: "bg-brand-500" },
    { label: "Carbs", hint: "for daily energy", value: snapshot.avgCarbs, bar: "bg-sky-400" },
    { label: "Healthy fats", hint: "for hormones & satiety", value: snapshot.avgFat, bar: "bg-amber-400" },
  ];
  const maxMacro = Math.max(1, ...macros.map((m) => m.value ?? 0));

  if (snapshot.count === 0) {
    return (
      <GlassCard title="Daily Client Avg" subtitle="What your active clients aim for each day">
        <p className="py-10 text-center text-sm text-stone-400">
          Add height, weight and activity to your clients to see their daily targets here.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard title="Daily Client Avg" subtitle="What your active clients aim for each day">
      <div className="flex items-baseline gap-2">
        {snapshot.avgCalories !== null ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-stone-900 tabular-nums">
              <CountUp value={snapshot.avgCalories} />
            </span>
            <span className="text-base font-medium text-stone-400">kcal / day</span>
          </>
        ) : (
          <span className="text-4xl font-semibold text-stone-900">—</span>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Average across <span className="font-medium text-stone-700">{snapshot.count}</span> active
        client{snapshot.count === 1 ? "" : "s"}
      </p>

      <ul className="mt-5 space-y-3">
        {macros.map((m) => (
          <BarRow
            key={m.label}
            name={m.label}
            value={m.value}
            unit="g"
            pct={((m.value ?? 0) / maxMacro) * 100}
            barClass={m.bar}
            hint={m.hint}
          />
        ))}
      </ul>
    </GlassCard>
  );
}

function ClientLookCard({ snapshot }: { snapshot: DashboardNutritionSnapshot }) {
  const maxCal = Math.max(1, ...snapshot.top.map((r) => r.calories ?? 0));

  return (
    <GlassCard title="Quick look" subtitle="Calorie targets by client">
      {snapshot.top.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">No calorie targets yet.</p>
      ) : (
        <ul className="space-y-3">
          {snapshot.top.map((row) => {
            const cal = row.calories ?? 0;
            return (
              <BarRow
                key={row.id}
                name={row.name}
                value={cal}
                unit="kcal"
                pct={(cal / maxCal) * 100}
                barClass="bg-gradient-to-r from-brand-500 to-sky-500"
              />
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-xs text-stone-400">
        Estimated from each client&apos;s latest check-in data.
      </p>
    </GlassCard>
  );
}

export function NutritionOverview({ snapshot }: { snapshot: DashboardNutritionSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DailyAvgCard snapshot={snapshot} />
      <ClientLookCard snapshot={snapshot} />
    </div>
  );
}