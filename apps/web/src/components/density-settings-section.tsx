import * as React from 'react'

import { cn } from '@/lib/utils'
import { GridDensityPreviewCard } from '@/components/grid-density-preview-card'
import { GridDensityToggle } from '@/components/grid-density-toggle'
import { ColumnOverrideSection } from '@/components/column-override-section'
import type { GridDensity, ColumnCount } from '@tiny-till/types'

interface DensitySettingsSectionProps {
  currentDensity: GridDensity
  columnCountOverride?: ColumnCount
  onDensityChange: (density: GridDensity) => void
  onColumnCountChange?: (count: ColumnCount | undefined) => void
  className?: string
}

export function DensitySettingsSection({
  currentDensity,
  columnCountOverride,
  onDensityChange,
  onColumnCountChange,
  className,
}: DensitySettingsSectionProps) {
  const handleDensityChange = (density: GridDensity) => {
    onDensityChange(density)
  }

  const sections: React.ReactNode[] = [
    <section key="density" className={cn('rounded-none border p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="mb-1 font-medium">Grid Density</h2>
          <p className="text-sm text-muted-foreground">
            Choose how products are displayed
          </p>
        </div>
        <GridDensityToggle
          value={currentDensity}
          onChange={handleDensityChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GridDensityPreviewCard
          density="normal"
          isActive={currentDensity === 'normal'}
          onClick={() => handleDensityChange('normal')}
        />
        <GridDensityPreviewCard
          density="compact"
          isActive={currentDensity === 'compact'}
          onClick={() => handleDensityChange('compact')}
        />
      </div>
    </section>,
  ]

  if (onColumnCountChange) {
    sections.push(
      <ColumnOverrideSection
        key="column-override"
        currentDensity={currentDensity}
        columnCountOverride={columnCountOverride}
        onColumnCountChange={onColumnCountChange}
      />
    )
  }

  return <div className={cn('flex flex-col gap-4', className)}>{sections}</div>
}
