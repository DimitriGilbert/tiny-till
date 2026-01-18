import * as React from 'react'

import { ColumnCountSlider } from '@/components/column-count-slider'
import { ColumnCountPreview } from '@/components/column-count-preview'
import { ResponsiveColumnIndicator } from '@/components/responsive-column-indicator'
import { OverrideStatusBadge } from '@/components/override-status-badge'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { GridDensity, ColumnCount } from '@tiny-till/types'
import { calculateColumns } from '@tiny-till/types'

interface ColumnOverrideSectionProps {
  currentDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  onColumnCountChange: (count: ColumnCount | undefined) => void
  className?: string
}

export function ColumnOverrideSection({
  currentDensity,
  columnCountOverride,
  onColumnCountChange,
  className,
}: ColumnOverrideSectionProps) {
  const [screenInfo, setScreenInfo] = React.useState({
    width: 0,
    autoColumns: 0,
  })

  const [previewColumns, setPreviewColumns] = React.useState(columnCountOverride ?? 0)

  React.useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const autoColumns = calculateColumns(width, currentDensity, undefined)
      
      setScreenInfo({ width, autoColumns })
      
      if (columnCountOverride === undefined) {
        setPreviewColumns(autoColumns)
      }
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

  React.useEffect(() => {
    if (columnCountOverride !== undefined) {
      setPreviewColumns(columnCountOverride)
    } else {
      setPreviewColumns(screenInfo.autoColumns)
    }
  }, [columnCountOverride, screenInfo.autoColumns])

  const handleSliderChange = (value: number) => {
    setPreviewColumns(value as ColumnCount)
  }

  const handleSliderChangeComplete = (value: number) => {
    onColumnCountChange(value as ColumnCount)
  }

  const handleResetToAuto = () => {
    onColumnCountChange(undefined)
  }

  const isOverridden = columnCountOverride !== undefined

  return (
    <section className={cn('rounded-none border p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="mb-1 font-medium">Column Override</h2>
          <p className="text-sm text-muted-foreground">
            Manually set the number of product columns
          </p>
        </div>
        <OverrideStatusBadge
          isOverridden={isOverridden}
          columnCount={columnCountOverride}
          onReset={isOverridden ? handleResetToAuto : undefined}
        />
      </div>

      <div className="grid gap-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Column Count Slider</CardTitle>
            <CardDescription className="text-xs">
              Adjust from 2 to 8 columns. Changes apply instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColumnCountSlider
              value={previewColumns}
              onChange={handleSliderChangeComplete}
            />
          </CardContent>
        </Card>

        <ColumnCountPreview
          columns={previewColumns}
          density={currentDensity}
          isOverridden={isOverridden}
        />

        <ResponsiveColumnIndicator
          screenWidth={screenInfo.width}
          autoColumns={screenInfo.autoColumns}
          manualColumns={columnCountOverride}
          isOverridden={isOverridden}
        />
      </div>
    </section>
  )
}
