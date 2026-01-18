import { createFileRoute, Link } from "@tanstack/react-router";
import { BackupReminderCard } from "@/components/backup-reminder-card";
import { BackupFrequencySelect } from "@/components/backup-frequency-select";
import { DensitySettingsSection } from "@/components/density-settings-section";
import { useSettingsStore } from "@/stores/settings-store";
import { toast } from "sonner";
import type { ColumnCount } from "@tiny-till/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettingsStore((state) => state)
  const setBackupReminder = useSettingsStore((state) => state.setBackupReminder)
  const setGridDensity = useSettingsStore((state) => state.setGridDensity)
  const setColumnCountOverride = useSettingsStore((state) => state.setColumnCountOverride)

  const handleDensityChange = (density: 'normal' | 'compact') => {
    try {
      setGridDensity(density)
      toast.success(`Grid density changed to ${density}`, {
        description: density === 'compact' 
          ? 'More products displayed per row' 
          : 'Larger, easier-to-tap product cards',
      })
    } catch (error) {
      toast.error('Failed to change grid density', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  const handleColumnCountChange = (count: number | undefined) => {
    try {
      setColumnCountOverride(count as ColumnCount | undefined)
      if (count !== undefined) {
        toast.success(`Column count set to ${count}`, {
          description: 'Manual override is now active',
        })
      } else {
        toast.success('Reset to auto columns', {
          description: 'Columns will adjust automatically',
        })
      }
    } catch (error) {
      toast.error('Failed to set column count', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-6">
        <BackupReminderCard />

        <section className="rounded-none border p-4">
          <h2 className="mb-4 font-medium">Backup Reminders</h2>
          <BackupFrequencySelect
            value={settings.backupReminder ?? 168}
            onChange={(value) => setBackupReminder(value)}
          />
        </section>

        <DensitySettingsSection
          currentDensity={settings.gridDensity}
          columnCountOverride={settings.columnCountOverride}
          onDensityChange={handleDensityChange}
          onColumnCountChange={handleColumnCountChange}
        />

        <section className="rounded-none border p-4">
          <h2 className="mb-2 font-medium">Theme Management</h2>
          <p className="text-muted-foreground">Theme options will be displayed here.</p>
        </section>

        <section className="rounded-none border p-4">
          <h2 className="mb-2 font-medium">Data Portability</h2>
          <div className="space-y-2">
            <Link to="/settings/catalog">
              <button
                type="button"
                className="w-full text-left px-4 py-2 rounded-none border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
              >
                Manage Catalog & Backups
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
