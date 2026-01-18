export type StorageType = 'localStorage' | 'indexedDB' | 'cache'

export type PreferredFormat = 'image/avif' | 'image/webp' | 'image/jpeg' | 'image/png'

export interface ImageFormatSupport {
  webP: boolean
  avif: boolean
  jpeg: boolean
  preferred: PreferredFormat
}

export interface StorageBreakdown {
  localStorage: {
    used: number
    items: number
  }
  indexedDB: {
    used: number
    items: number
  }
  cache: {
    used: number
    items: number
  }
  images: {
    used: number
    items: number
  }
}

export type StorageWarningLevel = 'normal' | 'warning' | 'critical'

export interface StorageQuotaConfig {
  warningThreshold: number
  criticalThreshold: number
  warningMessage: string
  criticalMessage: string
}

export interface DetailedStorageInfo {
  quotaUsed: number
  quotaLimit: number
  percentage: number
  warningLevel: StorageWarningLevel
  breakdown: StorageBreakdown
  lastUpdated: number
}

export const DEFAULT_STORAGE_QUOTA_CONFIG: StorageQuotaConfig = {
  warningThreshold: 70,
  criticalThreshold: 90,
  warningMessage: 'Storage is 70% full. Consider removing unused products.',
  criticalMessage: 'Storage is 90% full. Please free up space soon.',
}

export function calculateWarningLevel(
  percentage: number,
  config: StorageQuotaConfig = DEFAULT_STORAGE_QUOTA_CONFIG
): StorageWarningLevel {
  if (percentage >= config.criticalThreshold) {
    return 'critical'
  }
  if (percentage >= config.warningThreshold) {
    return 'warning'
  }
  return 'normal'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
