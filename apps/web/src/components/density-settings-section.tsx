import * as React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { GridDensityPreviewCard } from '@/components/grid-density-preview-card'
import { GridDensityToggle } from '@/components/grid-density-toggle'
import type { GridDensity, ColumnCount } from '@tiny-till/types'
import { calculateColumns } from '@tiny-till/types'

interface DensitySettingsSectionProps {
  currentDensity: GridDensity
  columnCountOverride?: ColumnCount
  onDensityChange: (density: GridDensity) => void
  className?: string
}

export function DensitySettingsSection({
  currentDensity,
  columnCountOverride,
  onDensityChange,
  className,
}: DensitySettingsSectionProps) {
  const [screenInfo, setScreenInfo] = React.useState({
    width: 0,
    columns: 0,
    breakpoint: '',
  })

  React.useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const columns = calculateColumns(width, currentDensity, columnCountOverride)
      const breakpoint = getBreakpointLabel(width)
      
      setScreenInfo({ width, columns, breakpoint })
    }

    updateScreenInfo()

    const resizeTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null }

    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(updateScreenInfo)
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [currentDensity, columnCountOverride])

  const handleDensityChange = (density: GridDensity) => {
    onDensityChange(density)
  }

  return (
    <section className={cn('rounded-none border p-4', className)}>
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

      <div className="mt-4 flex items-center justify-between rounded-sm bg-muted/50 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          {columnCountOverride ? (
            <span>
              Override: <span className="font-medium text-foreground">{screenInfo.columns} columns</span>
            </span>
          ) : (
            <span>
              Auto: <span className="font-medium text-foreground">{screenInfo.columns} columns</span> ({screenInfo.breakpoint})
            </span>
          )}
        </span>
        <span className="text-muted-foreground">
          {screenInfo.width}px
        </span>
      </div>
    </section>
  )
}

function getBreakpointLabel(width: number): string {
  if (width < 640) return 'Mobile'
  if (width < 768) return 'Large Mobile'
  if (width < 1024) return 'Tablet'
  if (width < 1280) return 'Desktop'
  if (width < 1536) return 'Large Desktop'
  return 'XL Desktop'
}
