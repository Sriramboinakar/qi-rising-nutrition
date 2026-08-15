import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveAccessToken } from "@/lib/access-token";
import { ClientPortalShell } from "@/components/client-portal-shell";
import { IntakeForm } from "@/components/intake-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Intake",
};

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clientId = await resolveAccessToken(token, "INTAKE");
  if (!clientId) notFound();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, firstName: true, intakeSubmittedAt: true },
  });
  if (!client) notFound();

  return (
    <ClientPortalShell
      title="Welcome to Qi Rising"
      subtitle="Complete your intake so your coach can personalise your nutrition plan."
    >
      {client.intakeSubmittedAt ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Your intake has already been submitted. If you need to make changes, please contact your coach.
        </div>
      ) : (
        <IntakeForm token={token} clientName={client.firstName} />
      )}
    </ClientPortalShell>
  );
}