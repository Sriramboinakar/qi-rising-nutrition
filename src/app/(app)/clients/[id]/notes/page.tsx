import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { createNote, deleteNote, togglePin } from "@/lib/actions/notes";
import { Button, Card, CardHeader, EmptyState, Input, Label, Textarea } from "@/components/ui";
import { Pin, StickyNote, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      coachNotes: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Add note" subtitle="Private notes only you can see." />
        <div className="px-5 py-5">
          <form
            action={async (fd: FormData) => {
              "use server";
              await createNote(id, fd);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Meal prep concerns" />
            </div>
            <div>
              <Label htmlFor="body">Note</Label>
              <Textarea id="body" name="body" rows={4} required />
            </div>
            <Button type="submit">Add note</Button>
          </form>
        </div>
      </Card>

      {client.coachNotes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-10 w-10" />}
          title="No notes yet"
          description="Private notes help you remember important details about this client."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {client.coachNotes.map((note) => (
            <Card key={note.id} className={note.pinned ? "border-amber-200 bg-amber-50/50" : ""}>
              <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {note.pinned ? <Pin className="h-3.5 w-3.5 text-amber-500" /> : null}
                    <h3 className="font-medium text-stone-900">{note.title}</h3>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">
                    {note.author.name} · {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <form
                    action={async () => {
                      "use server";
                      await togglePin(note.id, id);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-white hover:text-amber-600 cursor-pointer"
                      aria-label="Toggle pin"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteNote(note.id, id);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-white hover:text-red-600 cursor-pointer"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="whitespace-pre-wrap text-sm text-stone-700">{note.body}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}