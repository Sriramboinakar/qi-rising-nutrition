import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    console.log("LAYOUT-AUTH-NULL");
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        name={session.user.name ?? "Coach"}
        email={session.user.email ?? ""}
        role={session.user.role}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-8">{children}</main>
    </div>
  );
}