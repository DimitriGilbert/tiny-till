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

export function validateColumnCount(count: number): count is ColumnCount {
  return count === 2 || count === 3 || count === 4 || count === 5 || count === 6 || count === 7 || count === 8
}

export function getGridConfig(screenWidth: number, density: GridDensity, override?: ColumnCount): number {
  return calculateColumns(screenWidth, density, override)
}

export function getGridGap(density: GridDensity): string {
  return density === 'compact' ? 'gap-3' : 'gap-4'
}
