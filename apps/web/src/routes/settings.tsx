import * as React from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'
import { useTheme } from '@/components/theme-provider'
import { BackupReminderCard } from '@/components/backup-reminder-card'
import { BackupFrequencySelect } from '@/components/backup-frequency-select'
import { DensitySettingsSection } from '@/components/density-settings-section'
import { ThemeSettingsSection } from '@/components/theme-settings-section'
import { SettingsPreviewSection } from '@/components/settings-preview-section'
import { SettingsActionSection } from '@/components/settings-action-section'
import { ResetSettingsDialog } from '@/components/reset-settings-dialog'
import { showSettingsSuccess, showSettingsResetSuccess } from '@/components/settings-success-toast'
import { useOnboarding } from '@/components/onboarding-provider'
import { useSettingsStore } from '@/stores/settings-store'
import { useStorageStore } from '@/stores/storage-store'
import { StorageUsageDisplay } from '@/components/storage-usage-display'
import { StorageCleanupDialog } from '@/components/storage-cleanup-dialog'
import type { ColumnCount } from '@tiny-till/types'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const defaultSettings = {
  theme: 'system' as const,
  gridDensity: 'normal' as const,
  columnCountOverride: undefined as ColumnCount | undefined,
  backupReminder: 168,
  currency: 'USD' as const,
  locale: 'en-US',
}

function SettingsPage() {
  const gridDensity = useSettingsStore((state) => state.gridDensity)
  const columnCountOverride = useSettingsStore((state) => state.columnCountOverride)
  const backupReminder = useSettingsStore((state) => state.backupReminder)
  const currency = useSettingsStore((state) => state.currency)
  const locale = useSettingsStore((state) => state.locale)
  const hasUnsavedChanges = useSettingsStore((state) => state.hasUnsavedChanges)
  const changedSettings = useSettingsStore((state) => state.changedSettings)
  const markAsSaved = useSettingsStore((state) => state.markAsSaved)
  const setBackupReminder = useSettingsStore((state) => state.setBackupReminder)
  const setGridDensity = useSettingsStore((state) => state.setGridDensity)
  const setColumnCountOverride = useSettingsStore((state) => state.setColumnCountOverride)
  const resetSettings = useSettingsStore((state) => state.resetSettings)
  const { imageSupport } = useStorageStore()
  const { isCompleted, isSkipped, startOnboarding, resetOnboarding } = useOnboarding()
  const [cleanupDialogOpen, setCleanupDialogOpen] = React.useState(false)

  const { theme, resolvedTheme, setTheme } = useTheme()
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)

  const handleReplayOnboarding = React.useCallback(() => {
    resetOnboarding()
    startOnboarding()
    toast.success('Onboarding tour started')
  }, [resetOnboarding, startOnboarding])

  const getOnboardingStatus = React.useCallback((): string => {
    if (isSkipped) return 'Skipped'
    if (isCompleted) return 'Completed'
    return 'Not started'
  }, [isCompleted, isSkipped])

  const handleDensityChange = (density: 'normal' | 'compact') => {
    try {
      setGridDensity(density)
      showSettingsSuccess({
        setting: 'Grid Density',
        value: density,
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
        showSettingsSuccess({
          setting: 'Column Count',
          value: `${count} columns`,
          description: 'Manual override is now active',
        })
      } else {
        showSettingsSuccess({
          setting: 'Column Count',
          value: 'Auto',
          description: 'Columns will adjust automatically',
        })
      }
    } catch (error) {
      toast.error('Failed to set column count', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  const handleThemeChange = (newTheme: typeof theme) => {
    try {
      setTheme(newTheme)
      showSettingsSuccess({
        setting: 'Theme',
        value: newTheme === 'system' ? 'System' : newTheme,
        description: newTheme === 'system'
          ? 'Theme will follow system preference'
          : 'Theme set manually',
      })
    } catch (error) {
      toast.error('Failed to change theme', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  const handleBackupReminderChange = (days: number | undefined) => {
    try {
      setBackupReminder(days)
      showSettingsSuccess({
        setting: 'Backup Reminder',
        value: days ? `Every ${days} hours` : 'Off',
        description: days
          ? `You'll be reminded to backup every ${days} hours`
          : 'Backup reminders are disabled',
      })
    } catch (error) {
      toast.error('Failed to set backup reminder', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  const handleResetSettings = async () => {
    setIsResetting(true)
    try {
      resetSettings()
      showSettingsResetSuccess()
      markAsSaved()
      setResetDialogOpen(false)
    } catch (error) {
      toast.error('Failed to reset settings', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (resetDialogOpen) {
        setResetDialogOpen(false)
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault()
      if (hasUnsavedChanges && !resetDialogOpen) {
        setResetDialogOpen(true)
      }
    }
  }, [resetDialogOpen, hasUnsavedChanges])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentSettings = {
    theme,
    gridDensity,
    columnCountOverride,
    backupReminder,
    currency,
    locale,
  }

  return (
    <main
      className="container mx-auto max-w-3xl px-4 py-2"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && resetDialogOpen) {
          e.preventDefault()
          setResetDialogOpen(false)
        }
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {hasUnsavedChanges && (
          <div className="text-xs text-muted-foreground">
            {changedSettings.length} change{changedSettings.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <BackupReminderCard />

        <section className="rounded-none border p-4">
          <h2 className="mb-4 font-medium">Onboarding</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Status</div>
                <div className="text-xs text-muted-foreground">
                  {getOnboardingStatus()}
                </div>
              </div>
              <button
                type="button"
                onClick={handleReplayOnboarding}
                className="px-4 py-2 text-sm rounded-none border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Replay Tour
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-none border p-4">
          <h2 className="mb-4 font-medium">Backup Reminders</h2>
          <BackupFrequencySelect
            value={backupReminder ?? 168}
            onChange={handleBackupReminderChange}
          />
        </section>

        <ThemeSettingsSection
          currentTheme={theme}
          resolvedTheme={resolvedTheme}
          onThemeChange={handleThemeChange}
        />

        <DensitySettingsSection
          currentDensity={gridDensity}
          columnCountOverride={columnCountOverride}
          onDensityChange={handleDensityChange}
          onColumnCountChange={handleColumnCountChange}
        />

        <SettingsPreviewSection settings={currentSettings} />

        <SettingsActionSection
          hasChanges={hasUnsavedChanges}
          onReset={() => setResetDialogOpen(true)}
          onOpenResetDialog={() => setResetDialogOpen(true)}
          isResetting={isResetting}
        />

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

        <section className="rounded-none border p-4">
          <h2 className="mb-4 font-medium">Storage Management</h2>
          <div className="space-y-4">
            <StorageUsageDisplay />

            {imageSupport && (
              <div className="rounded-none bg-muted p-4">
                <h3 className="mb-2 text-sm font-medium">Image Format Support</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={imageSupport.avif ? 'text-green-600' : 'text-muted-foreground'}>
                    AVIF: {imageSupport.avif ? 'Supported' : 'Not Supported'}
                  </div>
                  <div className={imageSupport.webP ? 'text-green-600' : 'text-muted-foreground'}>
                    WebP: {imageSupport.webP ? 'Supported' : 'Not Supported'}
                  </div>
                  <div className={imageSupport.jpeg ? 'text-green-600' : 'text-muted-foreground'}>
                    JPEG: {imageSupport.jpeg ? 'Supported' : 'Not Supported'}
                  </div>
                  <div className="text-muted-foreground">
                    PNG: Supported
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Preferred format: <strong className="text-foreground">{imageSupport.preferred}</strong>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCleanupDialogOpen(true)}
              className="w-full text-left px-4 py-2 rounded-none border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
            >
              Cleanup Storage
            </button>
          </div>
        </section>
      </div>

      <ResetSettingsDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetSettings}
        currentSettings={currentSettings}
        defaultSettings={defaultSettings}
      />

      <StorageCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
      />

      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {hasUnsavedChanges
          ? `You have ${changedSettings.length} unsaved changes`
          : 'All settings are saved'}
      </div>
    </main>
  )
}
