"use client";

import { useEffect, useState } from "react";
import { getMessageTemplates, saveMessageTemplates, type MessageTemplates } from "@/lib/actions/messages";
import { Button, Label, Textarea } from "@/components/ui";

const FIELDS: { key: keyof MessageTemplates; label: string; hint: string }[] = [
  { key: "intake", label: "Intake invitation", hint: "Sent with the intake link. Use {link} for the link." },
  { key: "checkin", label: "Check-in reminder", hint: "Sent with the weekly check-in link. Use {link} for the link." },
  { key: "greeting", label: "Quick message", hint: "One-tap message from the client list. Use {name} for the client's first name." },
];

export function MessageTemplatesForm() {
  const [templates, setTemplates] = useState<MessageTemplates | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMessageTemplates()
      .then(setTemplates)
      .catch(() => setTemplates(null));
  }, []);

  async function save(formData: FormData) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await saveMessageTemplates(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save templates. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!templates) {
    return <p className="text-sm text-stone-400">Loading templates...</p>;
  }

  return (
    <form action={save} className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label htmlFor={`msg-${f.key}`}>{f.label}</Label>
          <Textarea
            id={`msg-${f.key}`}
            name={f.key}
            rows={2}
            defaultValue={templates[f.key]}
            className="scroll-mt-24"
          />
          <p className="mt-1 text-xs text-stone-400">{f.hint}</p>
        </div>
      ))}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save message templates"}
        </Button>
        {saved ? <span className="text-sm text-green-700">Saved</span> : null}
      </div>
    </form>
  );
}