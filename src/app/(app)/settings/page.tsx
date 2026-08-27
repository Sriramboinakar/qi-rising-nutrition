import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button, Card, CardHeader, Input, Label, PageHeader } from "@/components/ui";
import { saveSettings } from "@/lib/actions/settings";
import { TestDataCleanup } from "@/components/test-data-cleanup";

export const dynamic = "force-dynamic";

const SETTINGS_FIELDS = [
  { key: "platformName", label: "Platform name", description: "Shown on the login screen and emails." },
  { key: "coachingEmail", label: "Coaching email", description: "Contact email used for client communications." },
  { key: "defaultCheckInDay", label: "Default check-in day", description: "Which day of the week check-ins are expected." },
  { key: "followUpReminderDays", label: "Follow-up reminder (days)", description: "How many days before a follow-up to flag it." },
  { key: "businessHours", label: "Business hours", description: "e.g. Mon–Fri, 9 AM – 6 PM" },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const settings = await prisma.setting.findMany();
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration for the platform." />

      <Card className="max-w-2xl">
        <CardHeader title="General" subtitle="Adjust platform-level configuration." />
        <div className="px-5 py-5">
          <form
            action={saveSettings}
            className="space-y-5"
          >
            {SETTINGS_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input id={field.key} name={field.key} defaultValue={settingsMap.get(field.key) ?? ""} />
                <p className="mt-1 text-xs text-stone-400">{field.description}</p>
              </div>
            ))}
            <Button type="submit">Save settings</Button>
          </form>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader
          title="Data cleanup"
          subtitle="Remove test and demo clients that were created while testing the platform."
        />
        <div className="px-5 py-5">
          <TestDataCleanup />
        </div>
      </Card>
    </div>
  );
}