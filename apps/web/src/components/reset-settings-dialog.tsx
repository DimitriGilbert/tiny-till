import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Settings } from '@tiny-till/types'
import { Monitor, Grid, Columns, RefreshCw } from 'lucide-react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

interface ResetSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  currentSettings: Settings
  defaultSettings: Settings
  className?: string
}

const settingLabels: Record<keyof Settings, string> = {
  theme: 'Theme',
  gridDensity: 'Grid Density',
  columnCountOverride: 'Column Count',
  backupReminder: 'Backup Reminder',
  currency: 'Currency',
  locale: 'Locale',
}

const formatSettingValue = (key: keyof Settings, value: unknown): string => {
  if (value === undefined || value === null) {
    return 'Not set'
  }

  switch (key) {
    case 'theme':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1)
    case 'gridDensity':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1)
    case 'columnCountOverride':
      return value ? `${value} columns` : 'Auto'
    case 'backupReminder':
      return value ? `Every ${value} hours` : 'Off'
    case 'currency':
      return String(value)
    case 'locale':
      return String(value)
    default:
      return String(value)
  }
}

const getSettingIcon = (key: keyof Settings): React.ReactNode => {
  switch (key) {
    case 'theme':
      return <Monitor className="size-4" />
    case 'gridDensity':
    case 'columnCountOverride':
      return <Grid className="size-4" />
    case 'backupReminder':
      return <RefreshCw className="size-4" />
    case 'currency':
    case 'locale':
      return <Columns className="size-4" />
  }
}

export function ResetSettingsDialog({
  open,
  onOpenChange,
  onConfirm,
  currentSettings,
  defaultSettings,
  className,
}: ResetSettingsDialogProps) {
  const changedSettings = React.useMemo(() => {
    const changed: Array<{ key: keyof Settings; currentValue: unknown; defaultValue: unknown }> = []

    for (const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
      const current = currentSettings[key]
      const def = defaultSettings[key]

      if (current !== def) {
        changed.push({ key, currentValue: current, defaultValue: def })
      }
    }

    return changed
  }, [currentSettings, defaultSettings])

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset Settings to Defaults"
      description="This will restore all settings to their default values. This action cannot be undone."
      confirmLabel="Reset to Defaults"
      onConfirm={onConfirm}
      isDestructive
    >
      <div className={cn('space-y-3', className)}>
        {changedSettings.length === 0 ? (
          <div className="rounded-sm border border-muted-200 bg-muted/50 p-4 text-center dark:border-muted-800">
            <p className="text-sm text-muted-foreground">
              All settings are already at their default values.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The following settings will be reset:
            </p>

            <div className="space-y-2">
              {changedSettings.map(({ key, currentValue, defaultValue }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 p-3 dark:bg-muted/20"
                >
                  <div className="text-muted-foreground">
                    {getSettingIcon(key)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{settingLabels[key]}</div>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium text-foreground">
                        {formatSettingValue(key, currentValue)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-primary">
                        {formatSettingValue(key, defaultValue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-sm bg-amber-50 border border-amber-200 p-3 dark:bg-amber-950/20 dark:border-amber-900/30">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Note: This will not affect your product catalog or any tally data. Only display preferences will be reset.
              </p>
            </div>
          </div>
        )}
      </div>
    </ConfirmationDialog>
  )
}
