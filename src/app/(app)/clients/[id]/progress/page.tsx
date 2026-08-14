import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProgressEntryForm, PhotoForm } from "@/components/progress-forms";
import { LineChart } from "@/components/line-chart";
import { Card, CardHeader, EmptyState, Badge } from "@/components/ui";
import { formatDate, formatNumber } from "@/lib/utils";
import { PHOTO_TYPE_LABELS } from "@/lib/labels";
import { Camera, Ruler } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      progress: { orderBy: { date: "asc" } },
      photos: { orderBy: { date: "desc" } },
    },
  });

  if (!client) notFound();

  const weightPoints = client.progress
    .filter((p) => p.weightKg !== null)
    .map((p) => ({
      label: formatDate(p.date),
      value: Number(p.weightKg),
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Weight trend" subtitle="Progress over time" />
        <div className="px-5 py-5">
          <LineChart points={weightPoints} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Measurements" subtitle={`${client.progress.length} recorded`} />
          {client.progress.length === 0 ? (
            <div className="px-5 py-6">
              <EmptyState
                icon={<Ruler className="h-8 w-8" />}
                title="No measurements yet"
                description="Record measurements to track body composition changes."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Weight</th>
                    <th className="px-3 py-3 font-medium">Waist</th>
                    <th className="px-3 py-3 font-medium">Body fat</th>
                    <th className="px-3 py-3 font-medium">Chest</th>
                    <th className="px-3 py-3 font-medium">Hips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {client.progress
                    .slice()
                    .reverse()
                    .map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-2.5 text-stone-700">{formatDate(p.date)}</td>
                        <td className="px-3 py-2.5 text-stone-700">{formatNumber(Number(p.weightKg))}</td>
                        <td className="px-3 py-2.5 text-stone-700">{formatNumber(Number(p.waistCm))}</td>
                        <td className="px-3 py-2.5 text-stone-700">{formatNumber(Number(p.bodyFatPct))}</td>
                        <td className="px-3 py-2.5 text-stone-700">{formatNumber(Number(p.chestCm))}</td>
                        <td className="px-3 py-2.5 text-stone-700">{formatNumber(Number(p.hipsCm))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Progress photos" subtitle="Front, side, and back comparisons" />
          <div className="px-5 py-4">
            {client.photos.length > 0 ? (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {client.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-stone-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`${PHOTO_TYPE_LABELS[photo.type]} photo`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-[10px] font-medium text-white">
                        {PHOTO_TYPE_LABELS[photo.type]} · {formatDate(photo.date)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mb-4">
                <EmptyState
                  icon={<Camera className="h-8 w-8" />}
                  title="No photos yet"
                  description="Add a photo URL to build a visual comparison timeline."
                />
              </div>
            )}
            <PhotoForm clientId={client.id} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Record measurements" subtitle="Add a new progress entry" />
        <div className="px-5 py-5">
          <ProgressEntryForm clientId={client.id} />
        </div>
      </Card>
    </div>
  );
}