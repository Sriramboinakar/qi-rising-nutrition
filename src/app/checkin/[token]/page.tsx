import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveAccessToken } from "@/lib/access-token";
import { ClientPortalShell } from "@/components/client-portal-shell";
import { ClientCheckInForm } from "@/components/client-checkin-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly Check-in",
};

export default async function ClientCheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const clientId = await resolveAccessToken(token, "CHECKIN");
  if (!clientId) notFound();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, firstName: true, category: true },
  });
  if (!client) notFound();

  return (
    <ClientPortalShell
      title="Weekly check-in"
      subtitle="A quick check-in helps your coach track your progress and adjust your plan."
    >
      <ClientCheckInForm token={token} clientName={client.firstName} clientGoal={client.category} />
    </ClientPortalShell>
  );
}