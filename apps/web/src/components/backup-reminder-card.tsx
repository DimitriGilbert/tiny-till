import * as React from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSettingsStore } from '@/stores/settings-store'
import {
  getBackupReminderConfig,
  getBackupStatusColor,
  type BackupReminderConfig,
} from '@/lib/backup-reminder'
import { useCatalogExport } from '@/hooks/useCatalogExport'

export interface BackupReminderCardProps {
  className?: string
}

export function BackupReminderCard({
  className,
}: BackupReminderCardProps) {
  const backupReminder = useSettingsStore((state) => state.backupReminder)
  const { exportCatalog, isExporting } = useCatalogExport()
  const [backupConfig, setBackupConfig] =
    React.useState<BackupReminderConfig | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadConfig() {
      setIsLoading(true)
      const config = await getBackupReminderConfig(
        backupReminder ?? 168
      )
      setBackupConfig(config)
      setIsLoading(false)
    }
    loadConfig()
  }, [backupReminder])

  const handleCreateBackup = async () => {
    await exportCatalog()
  }

  if (isLoading || !backupConfig) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Backup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getBackupStatusColor(
    backupConfig.isBackupOverdue,
    backupConfig.daysSinceLastBackup
  )

  const statusConfig = {
    gray: {
      icon: Clock,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-muted',
      textColor: 'text-muted-foreground',
      title: 'No Backup Created Yet',
      description:
        'Create your first backup to protect your catalog data',
    },
    green: {
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900/30',
      textColor: 'text-green-900 dark:text-green-100',
      title: 'Backup Up to Date',
      description: `Last backup: ${backupConfig.lastBackupDate}`,
    },
    yellow: {
      icon: Clock,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-900/30',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      title: 'Backup Approaching Due',
      description: `Last backup: ${backupConfig.lastBackupDate}`,
    },
    red: {
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-900/30',
      textColor: 'text-red-900 dark:text-red-100',
      title: 'Backup Overdue',
      description: `Last backup: ${backupConfig.lastBackupDate}`,
    },
  }

  const status = statusConfig[statusColor]
  const StatusIcon = status.icon

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Backup Status</CardTitle>
        <CardDescription>
          Keep your catalog data safe with regular backups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}
        >
          <StatusIcon className={`h-5 w-5 ${status.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 space-y-1">
            <p className={`text-sm font-medium ${status.textColor}`}>
              {status.title}
            </p>
            <p className={`text-xs ${status.textColor}/80`}>
              {status.description}
            </p>
          </div>
        </div>

        {backupConfig.daysSinceLastBackup !== null && (
          <div className="text-sm text-muted-foreground">
            {backupConfig.daysSinceLastBackup === 0
              ? 'Backup created today'
              : `${backupConfig.daysSinceLastBackup} day${
                  backupConfig.daysSinceLastBackup !== 1 ? 's' : ''
                } since last backup`}
          </div>
        )}

        <Button
          onClick={handleCreateBackup}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Create Backup Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
