import * as React from 'react'

import { cn } from '@/lib/utils'
import type { GridDensity } from '@tiny-till/types'

interface GridDensityToggleProps {
  value: GridDensity
  onChange: (density: GridDensity) => void
  className?: string
}

export function GridDensityToggle({ value, onChange, className }: GridDensityToggleProps) {
  const handleChange = (density: GridDensity) => {
    onChange(density)
  }

  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-none border bg-muted p-1',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => handleChange('normal')}
        aria-label="Normal density"
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          value === 'normal'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <div className="flex items-center gap-2">
          <DensityPreviewIcon density="normal" />
          <span>Normal</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => handleChange('compact')}
        aria-label="Compact density"
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          value === 'compact'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <div className="flex items-center gap-2">
          <DensityPreviewIcon density="compact" />
          <span>Compact</span>
        </div>
      </button>
    </div>
  )
}

interface DensityPreviewIconProps {
  density: GridDensity
}

function DensityPreviewIcon({ density }: DensityPreviewIconProps) {
  const gap = density === 'normal' ? 2 : 1
  const dotSize = density === 'normal' ? 3 : 2.5
  
  return (
    <div className="flex items-end gap-0.5">
      <div
        className="rounded-full bg-current opacity-60"
        style={{ width: `${dotSize}px`, height: `${dotSize}px`, marginBottom: `${gap}px` }}
      />
      <div
        className="rounded-full bg-current opacity-60"
        style={{ width: `${dotSize}px`, height: `${dotSize}px`, marginBottom: `${gap}px` }}
      />
      <div
        className="rounded-full bg-current opacity-60"
        style={{ width: `${dotSize}px`, height: `${dotSize}px`, marginBottom: `${gap}px` }}
      />
    </div>
  )
}
