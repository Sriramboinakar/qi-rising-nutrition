import { prisma } from "@/lib/db";
import { ProgramForm } from "@/components/program-form";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";
import { CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { clients: true } } },
  });

  return (
    <StaggerChildren stagger={0.05} className="space-y-6">
      <PageHeader title="Programs" description="Manage the coaching programs offered to clients." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Create program" subtitle="Add a new coaching program." />
          <div className="px-5 py-5">
            <ProgramForm mode="create" />
          </div>
        </Card>

        {programs.map((program) => (
          <Card key={program.id} className="self-start">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-brand-600" />
                  {program.name}
                  {program.isActive ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Inactive</Badge>
                  )}
                </span>
              }
              subtitle={`${program.durationMonths} months · ${program._count.clients} client${program._count.clients === 1 ? "" : "s"}`}
            />
            <div className="px-5 py-5">
              <ProgramForm mode="edit" program={program} />
            </div>
          </Card>
        ))}
      </div>
    </StaggerChildren>
  );
}