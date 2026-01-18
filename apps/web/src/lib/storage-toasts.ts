import type { StorageWarningLevel } from '@tiny-till/types'
import { toast } from 'sonner'

export function showStorageWarning(level: StorageWarningLevel): void {
  if (level === 'critical') {
    toast.error('Storage Almost Full', {
      description: 'Please free up space to avoid data loss.',
      duration: 10000,
      action: {
        label: 'Manage Storage',
        onClick: () => {
          window.location.hash = '/settings'
        },
      },
    })
  } else if (level === 'warning') {
    toast.warning('Storage Running Low', {
      description: 'Consider removing unused products.',
      duration: 8000,
      action: {
        label: 'Manage Storage',
        onClick: () => {
          window.location.hash = '/settings'
        },
      },
    })
  }
}

export function showQuotaExceeded(): void {
  toast.error('Storage Quota Exceeded', {
    description: 'Cannot save data. Please clear some space and try again.',
    duration: 10000,
    action: {
      label: 'Clear Storage',
      onClick: () => {
        window.location.hash = '/settings'
      },
    },
  })
}

export function showStorageRecovered(bytesFreed: number): void {
  const mb = (bytesFreed / (1024 * 1024)).toFixed(1)
  toast.success('Storage Freed', {
    description: `${mb} MB of storage has been freed.`,
    duration: 5000,
  })
}

export function showImageOptimized(originalSize: number, newSize: number): void {
  const savings = ((originalSize - newSize) / originalSize) * 100

  if (savings > 10) {
    toast.success('Image Optimized', {
      description: `Reduced size by ${savings.toFixed(0)}%`,
      duration: 3000,
    })
  }
}

export function showImageFormatFallback(originalFormat: string, newFormat: string): void {
  toast.info('Format Fallback', {
    description: `${originalFormat} not supported, converted to ${newFormat}`,
    duration: 4000,
  })
}

export function showStorageCheckFailed(): void {
  toast.error('Storage Check Failed', {
    description: 'Unable to verify storage status. Some features may be limited.',
    duration: 6000,
  })
}

export function showCleanupProgress(current: number, total: number): void {
  const percentage = Math.round((current / total) * 100)
  toast.loading('Cleaning Storage', {
    description: `${percentage}% complete (${current}/${total} items)`,
  })
}

export function showCleanupComplete(itemsRemoved: number, bytesFreed: number): void {
  const mb = (bytesFreed / (1024 * 1024)).toFixed(1)
  toast.success('Cleanup Complete', {
    description: `Removed ${itemsRemoved} items, freed ${mb} MB`,
    duration: 5000,
  })
}
