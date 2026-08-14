import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClientTabs } from "@/components/client-tabs";
import { Badge, Button } from "@/components/ui";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES, GOAL_CATEGORY_LABELS } from "@/lib/labels";
import { fullName, initials, formatDate } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { program: true },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-semibold text-white">
            {initials(client.firstName, client.lastName)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                {fullName(client.firstName, client.lastName)}
              </h1>
              <Badge tone={CLIENT_STATUS_TONES[client.status]}>
                {CLIENT_STATUS_LABELS[client.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-stone-500">
              {GOAL_CATEGORY_LABELS[client.category]} ·{" "}
              {client.program ? client.program.name : "No program"}
              {client.programStartDate ? ` · started ${formatDate(client.programStartDate)}` : ""}
            </p>
          </div>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Edit profile
          </Button>
        </Link>
      </div>

      <ClientTabs clientId={client.id} />

      {children}
    </div>
  );
}