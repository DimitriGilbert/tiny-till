import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Settings } from '@tiny-till/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ColumnCountPreview } from '@/components/column-count-preview'
import { type GridDensity } from '@tiny-till/types'

type PreviewTab = 'tally' | 'catalog'

interface SettingsPreviewSectionProps {
  settings: Settings
  className?: string
}

export function SettingsPreviewSection({
  settings,
  className,
}: SettingsPreviewSectionProps) {
  const [activeTab, setActiveTab] = React.useState<PreviewTab>('tally')

  const handleTabChange = (tab: PreviewTab) => {
    setActiveTab(tab)
  }

  return (
    <section className={cn('rounded-none border p-4', className)}>
      <div className="mb-4">
        <h2 className="mb-1 font-medium">Live Preview</h2>
        <p className="text-sm text-muted-foreground">
          See how your settings affect the interface
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('tally')}
          aria-pressed={activeTab === 'tally'}
          aria-label="Show tally preview"
          className={cn(
            'px-3 py-1.5 text-sm rounded-sm border transition-all',
            activeTab === 'tally'
              ? 'border-primary bg-primary/5 text-foreground font-medium'
              : 'border-border bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          Tally Page
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('catalog')}
          aria-pressed={activeTab === 'catalog'}
          aria-label="Show catalog preview"
          className={cn(
            'px-3 py-1.5 text-sm rounded-sm border transition-all',
            activeTab === 'catalog'
              ? 'border-primary bg-primary/5 text-foreground font-medium'
              : 'border-border bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          Catalog
        </button>
      </div>

      {activeTab === 'tally' && (
        <Card size="sm" className="border-muted-200">
          <CardHeader className="pb-3">
            <CardTitle>Tally Grid Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnCountPreview
              columns={
                settings.columnCountOverride ??
                calculateColumns(settings.gridDensity, window.innerWidth)
              }
              density={settings.gridDensity}
              isOverridden={settings.columnCountOverride !== undefined}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'catalog' && (
        <Card size="sm" className="border-muted-200">
          <CardHeader className="pb-3">
            <CardTitle>Theme Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <ThemePreviewBox theme="light" />
              <ThemePreviewBox theme="dark" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {settings.theme === 'system'
                ? 'Using system preference'
                : `Currently set to ${settings.theme} mode`}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

interface ThemePreviewBoxProps {
  theme: 'light' | 'dark'
}

function ThemePreviewBox({ theme }: ThemePreviewBoxProps) {
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'rounded-sm border p-4 transition-all',
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="mb-2 text-sm font-medium" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
      </div>
      <div className="space-y-2">
        <div
          className="h-2 rounded-sm w-3/4"
          style={{ backgroundColor: isDark ? '#4b5563' : '#e5e7eb' }}
        />
        <div
          className="h-2 rounded-sm w-1/2"
          style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div
          className="size-4 rounded-sm"
          style={{
            backgroundColor: isDark ? '#3b82f6' : '#2563eb',
            opacity: 0.8,
          }}
        />
        <div className="h-2 rounded-sm flex-1" style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }} />
      </div>
    </div>
  )
}

function calculateColumns(density: GridDensity, screenWidth: number): number {
  const baseColumns = screenWidth < 640 ? 2 :
                      screenWidth < 768 ? 3 :
                      screenWidth < 1024 ? 4 : 6

  return density === 'compact' ? Math.ceil(baseColumns * 1.33) : baseColumns
}
