import type { ColumnCount, GridDensity } from '../entities/settings'

export function calculateColumns(
  screenWidth: number,
  density: GridDensity,
  override?: ColumnCount,
): number {
  if (override !== undefined) {
    return override
  }

  if (screenWidth < 320) return 2

  if (screenWidth < 768) {
    return density === 'compact' ? 3 : 2
  }

  if (screenWidth < 1024) {
    return density === 'compact' ? 6 : 4
  }

  if (screenWidth < 1280) {
    return density === 'compact' ? 7 : 6
  }

  if (screenWidth < 1536) {
    return density === 'compact' ? 8 : 7
  }

  return density === 'compact' ? 8 : 8
}

export function calculateOptimalColumns(
  containerWidth: number,
  density: GridDensity,
  itemSize: number,
  gap: number,
  minColumns: number = 2,
  maxColumns: number = 8,
): number {
  const multiplier = getDensityMultiplier(density)
  const effectiveItemSize = getEffectiveItemSize(itemSize, density)
  const effectiveGap = gap * multiplier
  const effectiveItemWidth = effectiveItemSize + effectiveGap
  
  const calculatedColumns = Math.floor(containerWidth / effectiveItemWidth)
  const clampedColumns = Math.max(minColumns, Math.min(maxColumns, calculatedColumns))
  
  return clampedColumns
}

export function getDensityMultiplier(density: GridDensity): number {
  return density === 'compact' ? 1.25 : 1.0
}

export function getEffectiveItemSize(baseSize: number, density: GridDensity): number {
  const multiplier = getDensityMultiplier(density)
  return baseSize / multiplier
}

export function calculateContainerBasedColumns(
  containerWidth: number,
  density: GridDensity,
  minColumns: number = 2,
  maxColumns: number = 8,
): number {
  const ITEM_SIZE_NORMAL = 80
  const GAP_NORMAL = 16
  const ITEM_SIZE_COMPACT = 60
  const GAP_COMPACT = 12
  
  const itemSize = density === 'compact' ? ITEM_SIZE_COMPACT : ITEM_SIZE_NORMAL
  const gap = density === 'compact' ? GAP_COMPACT : GAP_NORMAL
  
  return calculateOptimalColumns(
    containerWidth,
    density,
    itemSize,
    gap,
    minColumns,
    maxColumns,
  )
}

export function validateColumnCount(count: number): count is ColumnCount {
  return count === 2 || count === 3 || count === 4 || count === 5 || count === 6 || count === 7 || count === 8
}

export function getGridConfig(screenWidth: number, density: GridDensity, override?: ColumnCount): number {
  return calculateColumns(screenWidth, density, override)
}

export function getGridGap(density: GridDensity): string {
  return density === 'compact' ? 'gap-3' : 'gap-4'
}

export function getGridGapValue(density: GridDensity): number {
  return density === 'compact' ? 12 : 16
}

export function getItemSize(density: GridDensity): number {
  return density === 'compact' ? 60 : 80
}
