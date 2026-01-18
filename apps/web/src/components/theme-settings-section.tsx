import * as React from 'react'

import { cn } from '@/lib/utils'
import { type Theme } from '@tiny-till/types'
import { Monitor, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsStatusBadge } from '@/components/settings-status-badge'

interface ThemeSettingsSectionProps {
  currentTheme: Theme
  resolvedTheme: 'light' | 'dark'
  onThemeChange: (theme: Theme) => void
  className?: string
}

const themeOptions: Array<{
  value: Theme
  label: string
  icon: typeof Sun
  description: string
}> = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Light mode',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Use system preference',
  },
]

export function ThemeSettingsSection({
  currentTheme,
  resolvedTheme,
  onThemeChange,
  className,
}: ThemeSettingsSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent, theme: Theme) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onThemeChange(theme)
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const currentIndex = themeOptions.findIndex((opt) => opt.value === theme)
      const nextIndex = (currentIndex + 1) % themeOptions.length
      onThemeChange(themeOptions[nextIndex].value)
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const currentIndex = themeOptions.findIndex((opt) => opt.value === theme)
      const prevIndex = (currentIndex - 1 + themeOptions.length) % themeOptions.length
      onThemeChange(themeOptions[prevIndex].value)
    }
  }

  return (
    <section className={cn('rounded-none border p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="mb-1 font-medium">Theme</h2>
          <p className="text-sm text-muted-foreground">
            Choose your preferred color scheme
          </p>
        </div>
        <SettingsStatusBadge
          status={currentTheme === 'system' ? 'default' : 'modified'}
          label={currentTheme === 'system' ? 'System' : 'Custom'}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = currentTheme === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              aria-pressed={isActive}
              aria-label={`Select ${option.label} theme`}
              className={cn(
                'flex flex-col items-center gap-2 rounded-sm border-2 p-4 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-muted',
                'dark:hover:bg-muted/50'
              )}
            >
              <Icon className={cn('size-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <div className="text-center">
                <div className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {option.label}
                </div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>

              {option.value === 'system' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Currently: {resolvedTheme}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {currentTheme === 'system'
          ? 'Theme will automatically switch based on your system preferences.'
          : 'Theme is set manually and will not change with system preferences.'}
      </div>
    </section>
  )
}
