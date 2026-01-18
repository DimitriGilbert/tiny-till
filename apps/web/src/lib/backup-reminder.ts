import { safeGet, safeSet } from './storage'
import { STORAGE_KEYS } from './storage-keys'

export interface BackupReminderConfig {
  lastBackupTimestamp: number | null
  reminderFrequency: number
  isBackupOverdue: boolean
  daysSinceLastBackup: number | null
  lastBackupDate: string | null
}

export async function getLastBackupTimestamp(): Promise<number | null> {
  const timestamp = await safeGet<number>(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP)
  return timestamp ?? null
}

export async function setLastBackupTimestamp(timestamp: number): Promise<boolean> {
  return await safeSet(STORAGE_KEYS.LAST_BACKUP_TIMESTAMP, timestamp)
}

export function calculateDaysSinceBackup(timestamp: number): number {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffHours = diffMs / (1000 * 60 * 60)
  return Math.floor(diffHours / 24)
}

export function isBackupOverdue(
  timestamp: number | null,
  frequencyHours: number
): boolean {
  if (timestamp === null || frequencyHours === -1) {
    return false
  }

  const now = Date.now()
  const diffMs = now - timestamp
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours > frequencyHours
}

export function formatLastBackupDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = calculateDaysSinceBackup(timestamp)

  if (diffDays === 0) {
    return 'Today'
  }

  if (diffDays === 1) {
    return 'Yesterday'
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }

  return date.toLocaleDateString()
}

export async function getBackupReminderConfig(
  frequencyHours: number
): Promise<BackupReminderConfig> {
  const lastBackupTimestamp = await getLastBackupTimestamp()

  const daysSinceLastBackup =
    lastBackupTimestamp !== null
      ? calculateDaysSinceBackup(lastBackupTimestamp)
      : null

  const isOverdue = isBackupOverdue(lastBackupTimestamp, frequencyHours)

  const lastBackupDate =
    lastBackupTimestamp !== null
      ? formatLastBackupDate(lastBackupTimestamp)
      : null

  return {
    lastBackupTimestamp,
    reminderFrequency: frequencyHours,
    isBackupOverdue: isOverdue,
    daysSinceLastBackup,
    lastBackupDate,
  }
}

export function getBackupStatusColor(
  isOverdue: boolean,
  daysSinceBackup: number | null
): 'green' | 'yellow' | 'red' | 'gray' {
  if (daysSinceBackup === null) {
    return 'gray'
  }

  if (isOverdue) {
    return 'red'
  }

  if (daysSinceBackup >= 7) {
    return 'yellow'
  }

  return 'green'
}
