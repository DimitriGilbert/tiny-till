import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import type { DetailedValidationResult } from '@tiny-till/types'

interface ValidationSummaryProps {
  result: DetailedValidationResult
  fileName?: string
}

export function ValidationSummary({
  result,
  fileName,
}: ValidationSummaryProps) {
  const statusIcon = result.isValid ? (
    <CheckCircle2 className="h-8 w-8 text-green-500" />
  ) : result.summary.critical > 0 ? (
    <XCircle className="h-8 w-8 text-red-500" />
  ) : (
    <AlertTriangle className="h-8 w-8 text-yellow-500" />
  )

  const statusText = result.isValid
    ? 'Valid'
    : result.summary.critical > 0
      ? 'Critical Errors'
      : 'Issues Found'

  const statusColor = result.isValid
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : result.summary.critical > 0
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'

  const progressColor = result.isValid
    ? 'bg-green-500'
    : result.summary.critical > 0
      ? 'bg-red-500'
      : 'bg-yellow-500'

  const healthPercentage = Math.max(0, 100 - (result.summary.total * 10))

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-2 border-pink-200 dark:border-pink-900">
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-pink-400 to-purple-400 p-3 shadow-lg">
              {statusIcon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusText}
              </h3>
              {fileName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>
              )}
            </div>
          </div>
          <Badge className={statusColor}>{statusText}</Badge>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-4 dark:from-cyan-950 dark:to-blue-950">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <p className="font-semibold text-gray-900 dark:text-white">Validation Health</p>
          </div>
          <div className="mb-3">
            <Progress value={healthPercentage} max={100} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Health Score
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {healthPercentage}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatsRow
            label="Total Issues"
            value={result.summary.total}
            color={result.summary.total > 0 ? 'text-gray-600 dark:text-gray-400' : ''}
          />
          <StatsRow
            label="Critical"
            value={result.summary.critical}
            color="text-red-600 dark:text-red-400"
          />
          <StatsRow
            label="Errors"
            value={result.summary.errors}
            color="text-orange-600 dark:text-orange-400"
          />
          <StatsRow
            label="Warnings"
            value={result.summary.warnings}
            color="text-yellow-600 dark:text-yellow-400"
          />
          <StatsRow
            label="Information"
            value={result.summary.info}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatsRow
            label="Auto-fixable"
            value={result.canAutoFix ? 'Yes' : 'No'}
            color={result.canAutoFix ? 'text-green-600 dark:text-green-400' : ''}
          />
        </div>

        {result.versionCompatibility && (
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:from-amber-950 dark:to-orange-950">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-amber-400">
                <span className="block h-0.5 w-0.5 bg-white" />
              </span>
              Version Compatibility
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-lg bg-amber-100 px-3 py-1 dark:bg-amber-900">
                Import: {result.versionCompatibility.importVersion}
              </span>
              <span className="text-gray-400">→</span>
              <span className="rounded-lg bg-orange-100 px-3 py-1 dark:bg-orange-900">
                Current: {result.versionCompatibility.currentVersion}
              </span>
              {result.versionCompatibility.isCompatible ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            {!result.versionCompatibility.isCompatible && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {result.versionCompatibility.message}
              </p>
            )}
          </div>
        )}

        {result.integrity && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950 dark:to-teal-950">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400">
                <span className="block h-0.5 w-0.5 bg-white" />
              </span>
              Data Integrity
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-white/30 p-2 dark:bg-black/30">
                <span className="text-gray-600 dark:text-gray-400">Checksum</span>
                {result.integrity.checksumValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/30 p-2 dark:bg-black/30">
                <span className="text-gray-600 dark:text-gray-400">Data Integrity</span>
                {result.integrity.dataIntegrityValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              {result.integrity.corruptFields.length > 0 && (
                <div className="mt-2 rounded-lg bg-red-100 p-2 dark:bg-red-900">
                  <p className="text-xs text-red-800 dark:text-red-200">
                    Corrupt fields: {result.integrity.corruptFields.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {result.canAutoFix && (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 dark:from-green-950 dark:to-emerald-950">
            <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Auto-fix Available
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Some issues can be automatically fixed
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function StatsRow({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={color ? color : 'text-gray-900 dark:text-white'}>{value}</span>
    </div>
  )
}
