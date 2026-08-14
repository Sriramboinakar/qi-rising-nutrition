import { prisma } from "@/lib/db";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const programs = await prisma.program.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New client" description="Create a client profile. All information stays internal." />
      <ClientForm mode="create" programs={programs} />
    </div>
  );
}