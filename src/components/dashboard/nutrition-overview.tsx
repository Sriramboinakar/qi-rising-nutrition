"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/count-up";
import { cn } from "@/lib/utils";
import type { DashboardNutritionSnapshot, DashboardNutritionRow } from "@/lib/queries/dashboard";

const METRICS = {
  protein: { label: "Protein", color: "#10b981", unit: "g", kcal: 4 },
  carbs: { label: "Carbs", color: "#0ea5e9", unit: "g", kcal: 4 },
  fat: { label: "Fat", color: "#f59e0b", unit: "g", kcal: 9 },
} as const;

type Metric = keyof typeof METRICS;
const METRIC_KEYS = Object.keys(METRICS) as Metric[];

const EASE = [0.22, 1, 0.36, 1] as const;

function valueOf(row: DashboardNutritionRow, metric: Metric): number {
  const v = metric === "protein" ? row.proteinG : metric === "carbs" ? row.carbsG : row.fatG;
  return v ?? 0;
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex min-h-[16rem] items-center justify-center px-6 text-center">
      <p className="text-sm text-stone-400">{text}</p>
    </div>
  );
}

function Donut({
  segments,
  active,
}: {
  segments: { key: Metric; value: number; color: string }[];
  active: Metric;
}) {
  const size = 148;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label="Macro split chart">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f0ee" strokeWidth={stroke} />
      {segments.map((s) => {
        const len = (s.value / total) * C;
        const offset = -acc;
        acc += len;
        const dimmed = s.key !== active;
        return (
          <motion.circle
            key={s.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={offset}
            initial={{ opacity: 0 }}
            animate={{ opacity: dimmed ? 0.28 : 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        );
      })}
    </svg>
  );
}

function MacroSplitCard({
  snapshot,
}: {
  snapshot: DashboardNutritionSnapshot;
}) {
  const [active, setActive] = useState<Metric>("protein");
  const reduced = useReducedMotion();

  const values: Record<Metric, number> = {
    protein: snapshot.avgProtein ?? 0,
    carbs: snapshot.avgCarbs ?? 0,
    fat: snapshot.avgFat ?? 0,
  };

  const segments = METRIC_KEYS.filter((k) => values[k] > 0).map((k) => ({
    key: k,
    value: values[k] * METRICS[k].kcal,
    color: METRICS[k].color,
  }));

  const totalKcal = segments.reduce((s, x) => s + x.value, 0);
  const activeVal = values[active];
  const activePct = totalKcal > 0 ? Math.round((activeVal * METRICS[active].kcal * 100) / totalKcal) : 0;
  const maxClient = Math.max(1, ...snapshot.top.map((r) => valueOf(r, active)));

  if (snapshot.count === 0) {
    return <EmptyHint text="Add height, weight and activity data to clients to see their daily macro targets." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="relative">
          <Donut segments={segments} active={active} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-2xl font-semibold tracking-tight text-stone-900 tabular-nums">
                  {activeVal}
                  <span className="text-sm font-medium text-stone-400"> {METRICS[active].unit}</span>
                </p>
                <p className="text-[11px] font-medium text-stone-400">{activePct}% of calories</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-1 rounded-full bg-stone-100 p-1">
            {METRIC_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                className="relative cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:text-stone-900"
                aria-pressed={active === k}
              >
                {active === k ? (
                  <motion.span
                    layoutId="macro-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-stone-200"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                ) : null}
                <span className="relative z-10">{METRICS[k].label}</span>
              </button>
            ))}
          </div>
          <ul className="space-y-1">
            {METRIC_KEYS.map((k) => (
              <li key={k} className="flex items-center gap-2 text-xs text-stone-500">
                <span className="h-2 w-2 rounded-full" style={{ background: METRICS[k].color }} />
                {METRICS[k].label} · {values[k]} g · {Math.round((values[k] * METRICS[k].kcal * 100) / Math.max(totalKcal, 1))}%
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          Daily {METRICS[active].label.toLowerCase()} targets
        </p>
        <ul className="mt-2 space-y-2">
          {snapshot.top.map((row) => {
            const v = valueOf(row, active);
            const pct = Math.round((v / maxClient) * 100);
            return (
              <li key={row.id} className="flex items-center gap-3">
                <span className="w-28 truncate text-xs text-stone-600">{row.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: METRICS[active].color }}
                    initial={false}
                    animate={reduced ? undefined : { width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium tabular-nums text-stone-700">
                  {v || "—"} {METRICS[active].unit}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DailyCalorieCard({ snapshot }: { snapshot: DashboardNutritionSnapshot }) {
  const maxCal = Math.max(1, ...snapshot.top.map((r) => r.calories ?? 0));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Average daily target</p>
          {snapshot.avgCalories !== null ? (
            <p className="mt-1 flex items-baseline gap-1 text-3xl font-semibold tracking-tight text-stone-900 tabular-nums">
              <CountUp value={snapshot.avgCalories} />
              <span className="text-sm font-medium text-stone-400">kcal</span>
            </p>
          ) : (
            <p className="mt-1 text-3xl font-semibold text-stone-900">—</p>
          )}
          <p className="mt-0.5 text-xs text-stone-400">
            across {snapshot.count} active client{snapshot.count === 1 ? "" : "s"} with targets
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">Top target</p>
          <p className="text-lg font-semibold tabular-nums text-amber-700">
            {snapshot.top[0]?.calories ?? "—"} kcal
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-stone-400">By client</p>
      <ul className="mt-2 space-y-2">
        {snapshot.top.length === 0 ? (
          <li className="text-sm text-stone-400">No calorie targets yet.</li>
        ) : (
          snapshot.top.map((row) => {
            const cal = row.calories ?? 0;
            const pct = Math.round((cal / maxCal) * 100);
            return (
              <li key={row.id} className="flex items-center gap-3">
                <span className="w-28 truncate text-xs text-stone-600">{row.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-medium tabular-nums text-stone-700">
                  {cal ? `${cal}` : "—"}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export function NutritionOverview({ snapshot }: { snapshot: DashboardNutritionSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_1px_2px_rgb(0,0,0,0.04),0_12px_32px_-16px_rgb(0,0,0,0.14)] backdrop-blur-xl transition-colors hover:border-brand-200">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-stone-900">Daily macro targets</h3>
            <p className="text-xs text-stone-500">Interactive split — tap a macro to explore</p>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", snapshot.count ? "bg-brand-50 text-brand-700" : "bg-stone-100 text-stone-500")}>
            {snapshot.count} clients
          </span>
        </div>
        <MacroSplitCard snapshot={snapshot} />
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_1px_2px_rgb(0,0,0,0.04),0_12px_32px_-16px_rgb(0,0,0,0.14)] backdrop-blur-xl transition-colors hover:border-brand-200">
        <div className="mb-4">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Daily calorie targets</h3>
          <p className="text-xs text-stone-500">Estimated targets from latest client data</p>
        </div>
        <DailyCalorieCard snapshot={snapshot} />
      </div>
    </div>
  );
}