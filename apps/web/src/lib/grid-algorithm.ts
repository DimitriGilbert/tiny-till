import type { GridDensity, ColumnCount } from '@tiny-till/types'
import { calculateColumns, getGridGapValue, getItemSize, getDensityMultiplier } from '@tiny-till/types'

export interface AlgorithmInfo {
  screenWidth: number
  density: GridDensity
  multiplier: number
  calculatedColumns: number
  finalColumns: number
  isOverridden: boolean
  itemSize: number
  gap: number
  effectiveItemWidth: number
  breakdown: string
}

export function getGridAlgorithmInfo(
  screenWidth: number,
  density: GridDensity,
  override?: ColumnCount,
): AlgorithmInfo {
  const multiplier = getDensityMultiplier(density)
  const itemSize = getItemSize(density)
  const gap = getGridGapValue(density)
  const effectiveItemWidth = itemSize + gap
  const calculatedColumns = calculateColumns(screenWidth, density)
  const finalColumns = calculateColumns(screenWidth, density, override)
  const isOverridden = override !== undefined

  const breakdown = generateBreakdown(
    screenWidth,
    density,
    multiplier,
    itemSize,
    gap,
    effectiveItemWidth,
    calculatedColumns,
    finalColumns,
    isOverridden,
    override,
  )

  return {
    screenWidth,
    density,
    multiplier,
    calculatedColumns,
    finalColumns,
    isOverridden,
    itemSize,
    gap,
    effectiveItemWidth,
    breakdown,
  }
}

function generateBreakdown(
  screenWidth: number,
  density: GridDensity,
  multiplier: number,
  itemSize: number,
  gap: number,
  effectiveItemWidth: number,
  calculatedColumns: number,
  finalColumns: number,
  isOverridden: boolean,
  override?: ColumnCount,
): string {
  const lines: string[] = []

  lines.push(`Screen Width: ${screenWidth}px`)
  lines.push(`Density: ${density}`)
  lines.push(`Multiplier: ${multiplier}x`)
  lines.push(`Item Size: ${itemSize}px (${density})`)
  lines.push(`Grid Gap: ${gap}px`)
  lines.push(`Effective Item Width: ${effectiveItemWidth}px`)
  lines.push(`Calculated Columns: ${calculatedColumns}`)
  
  if (isOverridden) {
    lines.push(`Override: ${override} columns (user-set)`)
    lines.push(`Final: ${finalColumns} columns (override)`)
  } else {
    lines.push(`Final: ${finalColumns} columns (auto)`)
  }

  return lines.join('\n')
}

export function getTestScreenSizes(): Array<{ label: string; width: number }> {
  return [
    { label: 'Mobile Small', width: 320 },
    { label: 'Mobile Medium', width: 375 },
    { label: 'Mobile Large', width: 414 },
    { label: 'Tablet Portrait', width: 768 },
    { label: 'Tablet Landscape', width: 1024 },
    { label: 'Desktop', width: 1280 },
    { label: 'Desktop Large', width: 1536 },
    { label: 'Desktop XL', width: 1920 },
  ]
}

export function generateTestMatrix(): Array<{
  screenSize: string
  width: number
  normalColumns: number
  compactColumns: number
  multiplier: number
}> {
  const screenSizes = getTestScreenSizes()
  
  return screenSizes.map(({ label, width }) => {
    const normalColumns = calculateColumns(width, 'normal')
    const compactColumns = calculateColumns(width, 'compact')
    const multiplier = getDensityMultiplier('compact')

    return {
      screenSize: label,
      width,
      normalColumns,
      compactColumns,
      multiplier,
    }
  })
}

export function printTestMatrix(): void {
  const matrix = generateTestMatrix()
  
  console.log('\n=== Grid Density Test Matrix ===\n')
  console.log('Screen Size       | Width  | Normal | Compact | Multiplier')
  console.log('------------------|--------|--------|---------|-----------')
  
  matrix.forEach((row) => {
    const screenSize = row.screenSize.padEnd(17)
    const width = String(row.width).padStart(6)
    const normal = String(row.normalColumns).padStart(6)
    const compact = String(row.compactColumns).padStart(7)
    const multiplier = String(row.multiplier.toFixed(2)).padStart(9)
    
    console.log(`${screenSize}| ${width} | ${normal} | ${compact} | ${multiplier}x`)
  })
  
  console.log('\n')
}

export function getAlgorithmDocumentation(): string {
  const lines: string[] = []

  lines.push('=== Grid Density Algorithm Documentation ===\n')
  lines.push('Overview:')
  lines.push('The grid density algorithm calculates the optimal number of columns')
  lines.push('based on screen width and selected density mode (normal/compact).\n')
  
  lines.push('Formula:')
  lines.push('  effectiveItemWidth = itemSize + gap')
  lines.push('  columns = floor(containerWidth / effectiveItemWidth)')
  lines.push('  finalColumns = clamp(columns, minColumns, maxColumns)\n')
  
  lines.push('Density Modes:')
  lines.push('  Normal:')
  lines.push('    - Item Size: 80px')
  lines.push('    - Grid Gap: 16px (gap-4)')
  lines.push('    - Multiplier: 1.0x')
  lines.push('    - Touch targets: Standard')
  
  lines.push('  Compact:')
  lines.push('    - Item Size: 60px')
  lines.push('    - Grid Gap: 12px (gap-3)')
  lines.push('    - Multiplier: 1.25x')
  lines.push('    - Touch targets: Reduced (but still accessible)\n')
  
  lines.push('Responsive Breakpoints:')
  lines.push('  | Screen Size   | Normal | Compact |')
  lines.push('  |---------------|--------|---------|')
  lines.push('  | < 320px       | 2      | 2       |')
  lines.push('  | 320-767px     | 2      | 3       |')
  lines.push('  | 768-1023px    | 4      | 6       |')
  lines.push('  | 1024-1279px   | 6      | 7       |')
  lines.push('  | 1280-1535px   | 7      | 8       |')
  lines.push('  | >= 1536px     | 8      | 8       |\n')
  
  lines.push('Override Behavior:')
  lines.push('  - When columnCountOverride is set, it takes precedence')
  lines.push('  - Changing density recalculates the auto-calculated columns')
  lines.push('  - Override is preserved across density changes\n')
  
  lines.push('Performance Notes:')
  lines.push('  - Resize events are debounced (150ms)')
  lines.push('  - requestAnimationFrame is used for smooth updates')
  lines.push('  - Calculations are memoized to prevent unnecessary re-renders\n')

  return lines.join('\n')
}
