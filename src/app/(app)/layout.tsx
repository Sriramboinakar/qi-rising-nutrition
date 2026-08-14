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
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 pt-20 sm:px-6 sm:py-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}