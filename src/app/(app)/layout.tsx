import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { MainContent } from "@/components/main-content";

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
      <MainContent>{children}</MainContent>
    </div>
  );
}