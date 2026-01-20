import * as React from 'react'

import { cn } from '@/lib/utils'
import { RotateCcw, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

interface SettingsActionSectionProps {
  hasChanges: boolean
  onReset: () => void
  onOpenResetDialog: () => void
  isResetting?: boolean
  className?: string
}

export function SettingsActionSection({
  hasChanges,
  onReset,
  onOpenResetDialog,
  isResetting = false,
  className,
}: SettingsActionSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <section className={cn('rounded-none border p-4 space-y-4', className)}>
      <div>
        <h2 className="mb-1 font-medium">Actions</h2>
        <p className="text-sm text-muted-foreground">
          Manage your settings and data
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {hasChanges && (
          <Button
            type="button"
            variant="destructive"
            onClick={onOpenResetDialog}
            disabled={isResetting}
            className="h-auto gap-2 px-4 py-3 justify-start"
            onKeyDown={(e) => handleKeyDown(e, onOpenResetDialog)}
          >
            <RotateCcw className="size-4 shrink-0" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium">
                {isResetting ? 'Resetting...' : 'Reset to Defaults'}
              </span>
              <span className="text-xs opacity-70">
                Restore all settings to default values
              </span>
            </div>
          </Button>
        )}

        <Link to="/catalog">
          <button
            type="button"
            className={cn(
              'w-full h-auto gap-2 px-4 py-3 justify-start text-left rounded-sm border border-input bg-transparent',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'flex items-start'
            )}
          >
            <Upload className="size-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Manage Catalog</span>
              <span className="text-xs text-muted-foreground">
                Add, edit, import, or export products
              </span>
            </div>
          </button>
        </Link>
      </div>

      <div className="rounded-sm border border-border bg-muted/30 p-3 dark:bg-muted/20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <div className="size-2 rounded-full bg-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Settings are saved automatically</p>
            <p className="text-xs text-muted-foreground">
              All changes are saved to your browser's local storage. You can reset settings at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
