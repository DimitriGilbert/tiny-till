import { createFileRoute, Link } from "@tanstack/react-router";
import { BackupReminderCard } from "@/components/backup-reminder-card";
import { BackupFrequencySelect } from "@/components/backup-frequency-select";
import { useSettingsStore } from "@/stores/settings-store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettingsStore((state) => state)
  const setBackupReminder = useSettingsStore((state) => state.setBackupReminder)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-6">
        <BackupReminderCard />

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-medium">Backup Reminders</h2>
          <BackupFrequencySelect
            value={settings.backupReminder ?? 168}
            onChange={(value) => setBackupReminder(value)}
          />
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-medium">Data Portability</h2>
          <div className="space-y-2">
            <Link to="/settings/catalog">
              <button
                type="button"
                className="w-full text-left px-4 py-2 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
              >
                Manage Catalog & Backups
              </button>
            </Link>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Theme Management</h2>
          <p className="text-muted-foreground">Theme options will be displayed here.</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Display Preferences</h2>
          <p className="text-muted-foreground">Display options will be displayed here.</p>
        </section>
      </div>
    </div>
  );
}
