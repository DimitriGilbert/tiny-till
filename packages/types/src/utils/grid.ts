import type { ColumnCount, GridDensity } from '../entities/settings'

export function calculateColumns(
  screenWidth: number,
  density: GridDensity,
  override?: ColumnCount,
): number {
  if (override !== undefined) {
    return override
  }

  const baseColumns =
    screenWidth < 640 ? 2 : screenWidth < 768 ? 3 : screenWidth < 1024 ? 4 : 6

  return density === 'compact' ? Math.ceil(baseColumns * 1.33) : baseColumns
}

export function validateColumnCount(count: number): count is ColumnCount {
  return count === 2 || count === 3 || count === 4 || count === 5 || count === 6 || count === 7 || count === 8
}

export function getGridConfig(screenWidth: number, density: GridDensity, override?: ColumnCount): number {
  return calculateColumns(screenWidth, density, override)
}
