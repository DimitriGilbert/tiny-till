import * as React from 'react'
import { HardDrive, Database, Image as ImageIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStorageStore } from '@/stores/storage-store'
import { formatBytes } from '@tiny-till/types'

interface StorageUsageDisplayProps {
  className?: string
}

export function StorageUsageDisplay({ className }: StorageUsageDisplayProps) {
  const { storageInfo, isLoading } = useStorageStore()

  if (isLoading || !storageInfo) {
    return null
  }

  const { quotaUsed, quotaLimit, percentage, breakdown } = storageInfo
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive'
    if (percentage >= 70) return 'bg-yellow-600'
    return 'bg-primary'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {formatBytes(quotaUsed)} of {formatBytes(quotaLimit)} used
            </span>
            <span className={percentage >= 70 ? 'text-yellow-600' : 'text-muted-foreground'}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
          />
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Images</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{breakdown.images.items} items</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(breakdown.images.used)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Product Data</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{breakdown.indexedDB.items} items</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(breakdown.indexedDB.used)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Settings</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{breakdown.localStorage.items} items</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(breakdown.localStorage.used)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
