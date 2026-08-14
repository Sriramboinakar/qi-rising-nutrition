import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function testAuth() {
  const session = await auth();
  return `auth ok: ${session?.user?.email ?? "none"}`;
}

async function testDb() {
  const count = await prisma.program.count();
  return `db ok: ${count} programs`;
}

export default function TestActionPage() {
  return (
    <div className="space-y-4 p-8">
      <form
        action={async (fd: FormData) => {
          "use server";
          console.log("RESULT-FORM", {
            auth: (await auth())?.user?.email,
            programCount: await prisma.program.count(),
            name: fd.get("name"),
          });
          const p = await prisma.setting.upsert({
            where: { key: "test-key" },
            update: { value: `touched-${Date.now()}` },
            create: { key: "test-key", value: "test" },
          });
          console.log("RESULT-FORM", "write ok:", p.value);
        }}
      >
        <input name="name" defaultValue="hello" />
        <button className="border p-2">Run form action (auth + db read + write)</button>
      </form>
      <form action={async () => { "use server"; console.log("RESULT", await testAuth()); }}>
        <button className="border p-2">Run auth()</button>
      </form>
      <form action={async () => { "use server"; console.log("RESULT", await testDb()); }}>
        <button className="border p-2">Run db read</button>
      </form>
    </div>
  );
}