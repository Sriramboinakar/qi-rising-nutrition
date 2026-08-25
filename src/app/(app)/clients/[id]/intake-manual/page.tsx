import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { ManualIntakeForm } from "@/components/manual-intake-form";
import { Card, CardHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ManualIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || !session?.user || client.coachId !== session.user.id) notFound();

  return (
    <Card>
      <CardHeader
        title="Enter intake manually"
        subtitle="Record the client's intake data yourself. This saves to their profile and marks the intake as submitted."
      />
      <div className="px-5 py-5">
        <ManualIntakeForm client={client} />
      </div>
    </Card>
  );
}