import * as React from 'react'
import { Search, Filter, Download, Trash2, XCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { errorLogger } from '@/lib/error-logger'
import type { ErrorLog, ErrorFilterOptions, ErrorSeverity } from '@/lib/error-types'

export interface ErrorLogViewerProps {
  isOpen: boolean
  onClose: () => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export function ErrorLogViewer({
  isOpen,
  onClose,
  autoRefresh = false,
  refreshInterval = 5000,
}: ErrorLogViewerProps) {
  const [logs, setLogs] = React.useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = React.useState<ErrorLog[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedSeverity, setSelectedSeverity] = React.useState<ErrorSeverity | 'all'>('all')
  const [selectedType, setSelectedType] = React.useState<string | 'all'>('all')
  const [resolvedFilter, setResolvedFilter] = React.useState<string>('all')
  const [selectedLog, setSelectedLog] = React.useState<ErrorLog | null>(null)
  const [isAutoRefresh, setIsAutoRefresh] = React.useState(autoRefresh)

  const logsRef = React.useRef<ErrorLog[]>([])
  logsRef.current = logs

  const loadLogs = React.useCallback(() => {
    const newLogs = errorLogger.getRecentLogs(100)
    setLogs(newLogs)
  }, [])

  const applyFilters = React.useCallback(() => {
    const filters: ErrorFilterOptions = {}

    if (searchQuery) {
      filters.searchQuery = searchQuery
    }
    if (selectedSeverity !== 'all') {
      filters.severity = selectedSeverity
    }
    if (selectedType !== 'all') {
      filters.type = selectedType
    }
    if (resolvedFilter !== 'all') {
      filters.resolved = resolvedFilter === 'true'
    }

    const filtered = errorLogger.filterLogs(filters)
    setFilteredLogs(filtered)
  }, [searchQuery, selectedSeverity, selectedType, resolvedFilter])

  React.useEffect(() => {
    loadLogs()
  }, [loadLogs])

  React.useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(loadLogs, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [isAutoRefresh, refreshInterval, loadLogs])

  React.useEffect(() => {
    applyFilters()
  }, [logs, searchQuery, selectedSeverity, selectedType, resolvedFilter, applyFilters])

  const handleExport = () => {
    const exportedLogs = errorLogger.exportLogs()
    const blob = new Blob([exportedLogs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      errorLogger.clearLog()
      setLogs([])
      setFilteredLogs([])
    }
  }

  const getSeverityColor = (severity: ErrorSeverity) => {
    const colors = {
      debug: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[severity]
  }

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'debug':
        return <Info className="h-3 w-3" />
      case 'info':
        return <Info className="h-3 w-3" />
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />
      case 'error':
        return <XCircle className="h-3 w-3" />
      case 'critical':
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  const uniqueTypes = Array.from(new Set(logs.map((log) => log.type)))

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Log Viewer</DialogTitle>
            <DialogDescription>
              View and manage system error logs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as ErrorSeverity | 'all')}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={resolvedFilter}
                onChange={(e) => setResolvedFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="false">Unresolved</option>
                <option value="true">Resolved</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutoRefresh}
                    onChange={(e) => setIsAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredLogs.length} of {logs.length} errors
                </span>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearLogs}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Severity</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-left font-medium">Message</th>
                    <th className="px-3 py-2 text-left font-medium">Timestamp</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                        No errors found matching the filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-3 py-2">
                          <Badge className={getSeverityColor(log.severity)} variant="secondary">
                            <div className="flex items-center gap-1">
                              {getSeverityIcon(log.severity)}
                              {log.severity.toUpperCase()}
                            </div>
                          </Badge>
                        </td>
                        <td className="px-3 py-2 capitalize">{log.type}</td>
                        <td className="px-3 py-2 truncate max-w-[300px]">{log.message}</td>
                        <td className="px-3 py-2 text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {log.resolved ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                              Unresolved
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedLog && (
        <ErrorDetailPanel
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      )}
    </>
  )
}

interface ErrorDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  log: ErrorLog
}

function ErrorDetailPanel({ isOpen, onClose, log }: ErrorDetailPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Error Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Error Code</p>
              <p className="font-mono text-sm">{log.code}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="capitalize">{log.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Severity</p>
              <p className="capitalize">{log.severity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Timestamp</p>
              <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm">{log.message}</p>
          </div>

          {log.context && Object.keys(log.context).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Context</p>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </div>
          )}

          {log.stackTrace && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stack Trace</p>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-xs text-muted-foreground">
                {log.stackTrace}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Retry Count</p>
              <p className="text-sm">{log.retryCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-sm">{log.resolved ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
