import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, programs] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!client) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Edit client" description="Update profile, program, and status." />
      <ClientForm mode="edit" client={client} programs={programs} />
    </div>
  );
}