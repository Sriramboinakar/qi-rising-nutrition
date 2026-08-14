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
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white sm:h-14 sm:w-14 sm:text-lg">
            {initials(client.firstName, client.lastName)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
                {fullName(client.firstName, client.lastName)}
              </h1>
              <Badge tone={CLIENT_STATUS_TONES[client.status]}>
                {CLIENT_STATUS_LABELS[client.status]}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-stone-500">
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