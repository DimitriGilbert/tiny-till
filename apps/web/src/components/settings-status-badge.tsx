import * as React from 'react'

import { cn } from '@/lib/utils'
import { Check, RefreshCw, AlertCircle } from 'lucide-react'

export type SettingsStatus = 'default' | 'modified' | 'syncing' | 'success'

interface SettingsStatusBadgeProps {
  status: SettingsStatus
  label?: string
  showText?: boolean
  className?: string
}

export function SettingsStatusBadge({
  status,
  label,
  showText = true,
  className,
}: SettingsStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'default':
        return {
          icon: null,
          text: label || 'Default',
          bgColor: 'bg-muted/30',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
          ariaLabel: 'Settings are at default values',
        }
      case 'modified':
        return {
          icon: AlertCircle,
          text: label || 'Modified',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          textColor: 'text-amber-700 dark:text-amber-400',
          borderColor: 'border-amber-200 dark:border-amber-900/30',
          ariaLabel: 'Settings have been modified',
        }
      case 'syncing':
        return {
          icon: RefreshCw,
          text: label || 'Syncing',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-900/30',
          ariaLabel: 'Settings are syncing',
        }
      case 'success':
        return {
          icon: Check,
          text: label || 'Saved',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-900/30',
          ariaLabel: 'Settings saved successfully',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs transition-all duration-200',
        config.bgColor,
        config.borderColor,
        config.textColor,
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'size-3.5',
            status === 'syncing' && 'animate-spin'
          )}
          aria-hidden="true"
        />
      )}
      {showText && <span>{config.text}</span>}
    </div>
  )
}
