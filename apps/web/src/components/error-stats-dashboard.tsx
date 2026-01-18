import * as React from 'react'
import { TrendingUp, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { errorLogger } from '@/lib/error-logger'
import type { ErrorTimeline, ErrorStats } from '@/lib/error-types'

export interface ErrorStatsDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function ErrorStatsDashboard({ isOpen, onClose }: ErrorStatsDashboardProps) {
  const [stats, setStats] = React.useState<ErrorStats | null>(null)
  const [timeline, setTimeline] = React.useState<ErrorTimeline[]>([])
  const [selectedDays, setSelectedDays] = React.useState(7)

  const loadStats = React.useCallback(() => {
    const errorStats = errorLogger.getStats()
    setStats(errorStats)
  }, [])

  const loadTimeline = React.useCallback(() => {
    const errorTimeline = errorLogger.getTimeline(selectedDays)
    setTimeline(errorTimeline)
  }, [selectedDays])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  React.useEffect(() => {
    loadTimeline()
  }, [selectedDays, loadTimeline])

  if (!stats) {
    return null
  }

  const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 100
  const topErrors = Object.entries(stats.byCode)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Error Statistics Dashboard</DialogTitle>
          <DialogDescription>
            Overview of system errors and their resolution status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Errors"
              value={stats.total}
              icon={<Activity className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="green"
            />
            <StatCard
              title="Unresolved"
              value={stats.unresolved}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="orange"
            />
            <StatCard
              title="Resolution Rate"
              value={`${resolutionRate.toFixed(1)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color={resolutionRate >= 80 ? 'green' : resolutionRate >= 60 ? 'yellow' : 'red'}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Errors by Type</h3>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Errors by Severity</h3>
              <div className="space-y-2">
                {Object.entries(stats.bySeverity)
                  .sort(([, a], [, b]) => b - a)
                  .map(([severity, count]) => (
                    <SeverityBar
                      key={severity}
                      severity={severity as any}
                      count={count}
                      total={stats.total}
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Timeline (Last {selectedDays} Days)</h3>
              <div className="flex gap-2">
                {[7, 14, 30].map((days) => (
                  <Button
                    key={days}
                    variant={selectedDays === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDays(days)}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
            <TimelineChart timeline={timeline} />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Top Error Codes</h3>
            <div className="space-y-2">
              {topErrors.map(([code, count]) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-2 rounded bg-muted/30"
                >
                  <span className="font-mono text-sm">{code}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recoverable Errors</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.recoverable}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Non-Recoverable Errors
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.nonRecoverable}
                </p>
              </div>
            </Card>
          </div>

          {stats.oldestTimestamp && stats.newestTimestamp && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                First error:{' '}
                {new Date(stats.oldestTimestamp).toLocaleDateString()}
              </span>
              <span>
                Latest error:{' '}
                {new Date(stats.newestTimestamp).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red' | 'yellow'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  }

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
  }

  return (
    <Card className={cn('p-4 border', colorClasses[color])}>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg bg-background', iconColorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

interface SeverityBarProps {
  severity: string
  count: number
  total: number
}

function SeverityBar({ severity, count, total }: SeverityBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colors = {
    debug: 'bg-gray-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-orange-500',
    critical: 'bg-red-500',
  }

  const badgeColors = {
    debug: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="capitalize">{severity}</span>
        <Badge className={badgeColors[severity as keyof typeof badgeColors]} variant="secondary">
          {count}
        </Badge>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn('h-2 rounded-full transition-all', colors[severity as keyof typeof colors])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface TimelineChartProps {
  timeline: ErrorTimeline[]
}

function TimelineChart({ timeline }: TimelineChartProps) {
  const maxValue = Math.max(...timeline.map((t) => t.count), 1)

  return (
    <div className="space-y-2">
      {timeline.map((item) => {
        const height = (item.count / maxValue) * 100
        return (
          <div key={item.date} className="flex items-center gap-3">
            <div className="w-24 text-sm text-muted-foreground">
              {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex-1 flex items-end gap-1 h-20">
              <div
                className="flex-1 bg-primary rounded-t transition-all hover:bg-primary/80"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${item.count} errors`}
              />
            </div>
            <div className="text-sm font-medium w-8 text-right">
              {item.count}
            </div>
            <div className="flex gap-1 ml-2">
              {Object.entries(item.bySeverity).map(([severity, count]) => (
                <div
                  key={severity}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: {
                      debug: '#6b7280',
                      info: '#3b82f6',
                      warning: '#eab308',
                      error: '#f97316',
                      critical: '#ef4444',
                    }[severity as keyof typeof item.bySeverity],
                  }}
                  title={`${severity}: ${count}`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
