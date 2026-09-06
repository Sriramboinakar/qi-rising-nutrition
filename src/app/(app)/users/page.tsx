import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsersForAdmin } from "@/lib/queries/admin";
import { UserForm } from "@/components/user-form";
import { UserRow } from "@/components/user-row";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { StaggerChildren } from "@/components/stagger-children";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const users = await getUsersForAdmin();

  return (
    <StaggerChildren stagger={0.05} className="space-y-6">
      <PageHeader title="Users" description="Manage coaches and administrators who access the platform." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-1">
          <CardHeader title="Invite user" subtitle="Create a login for a coach or admin." />
          <div className="px-5 py-5">
            <UserForm />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Team members" subtitle={`${users.length} accounts`} />
          <div>
            {users.map((user) => (
              <UserRow key={user.id} user={user} isSelf={user.id === session.user.id} />
            ))}
          </div>
        </Card>
      </div>
    </StaggerChildren>
  );
}