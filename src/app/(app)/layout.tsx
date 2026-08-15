import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { MainContent } from "@/components/main-content";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Authentication is enforced by src/middleware.ts so the session is always present here.

  return (
    <div className="flex min-h-screen">
      <Sidebar
        name={session?.user?.name ?? "Coach"}
        email={session?.user?.email ?? ""}
        role={session?.user?.role ?? "COACH"}
      />
      <MainContent>{children}</MainContent>
    </div>
  );
}