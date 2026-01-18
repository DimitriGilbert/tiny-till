import { XCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import type { ValidationIssue } from '@tiny-till/types'

interface ValidationIssueListProps {
  issues: ValidationIssue[]
  showContext?: boolean
  onApplySuggestion?: (suggestionId: string) => void
}

export function ValidationIssueList({
  issues,
  showContext = true,
  onApplySuggestion,
}: ValidationIssueListProps) {
  const groupedIssues = groupIssuesBySeverity(issues)

  return (
    <div className="space-y-6">
      {groupedIssues.critical.length > 0 && (
        <IssueGroup
          title="Critical Issues"
          issues={groupedIssues.critical}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          badgeColor="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.errors.length > 0 && (
        <IssueGroup
          title="Errors"
          issues={groupedIssues.errors}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          badgeColor="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.warnings.length > 0 && (
        <IssueGroup
          title="Warnings"
          issues={groupedIssues.warnings}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          badgeColor="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.info.length > 0 && (
        <IssueGroup
          title="Information"
          issues={groupedIssues.info}
          icon={<Info className="h-5 w-5 text-blue-500" />}
          badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}
    </div>
  )
}

interface IssueGroupProps {
  title: string
  issues: ValidationIssue[]
  icon: React.ReactNode
  badgeColor: string
  showContext: boolean
  onApplySuggestion?: (suggestionId: string) => void
}

function IssueGroup({
  title,
  issues,
  icon,
  badgeColor,
  showContext,
  onApplySuggestion,
}: IssueGroupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        <Badge className={badgeColor}>{issues.length}</Badge>
      </div>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <IssueCard
            key={`${issue.code}-${index}`}
            issue={issue}
            showContext={showContext}
            onApplySuggestion={onApplySuggestion}
          />
        ))}
      </div>
    </div>
  )
}

function IssueCard({
  issue,
  showContext,
  onApplySuggestion,
}: {
  issue: ValidationIssue
  showContext: boolean
  onApplySuggestion?: (suggestionId: string) => void
}) {
  return (
    <Collapsible className="rounded-lg border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 p-4 dark:border-pink-900 dark:from-pink-950 dark:to-purple-950">
      <CollapsibleTrigger className="flex w-full items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {issue.field && (
              <code className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-0.5 text-sm font-mono dark:from-purple-900 dark:to-pink-900">
                {issue.field}
              </code>
            )}
            {issue.line && (
              <span className="rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-2 py-0.5 text-xs font-medium dark:from-cyan-900 dark:to-blue-900">
                Line {issue.line}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{issue.message}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-3">
        {issue.value !== undefined && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Current Value
            </p>
            <code className="block rounded-lg bg-white/50 p-3 text-xs shadow-inner dark:bg-black/50">
              {JSON.stringify(issue.value, null, 2)}
            </code>
          </div>
        )}

        {issue.expectedValue !== undefined && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Expected Value
            </p>
            <code className="block rounded-lg bg-green-100 p-3 text-xs dark:bg-green-900">
              {JSON.stringify(issue.expectedValue, null, 2)}
            </code>
          </div>
        )}

        {issue.context && showContext && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Context
            </p>
            <pre className="overflow-x-auto rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-3 text-xs shadow-inner dark:from-gray-800 dark:to-gray-900">
              {issue.context}
            </pre>
          </div>
        )}

        {issue.recoverySuggestions && issue.recoverySuggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Recovery Suggestions
            </p>
            <div className="space-y-2">
              {issue.recoverySuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start justify-between rounded-lg border-2 border-dashed border-purple-300 bg-white/30 p-3 dark:border-purple-700 dark:bg-black/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{suggestion.action}</p>
                      {suggestion.autoFixable && (
                        <Badge variant="success">Auto-fixable</Badge>
                      )}
                      {suggestion.severity === 'required' && (
                        <Badge variant="critical">Required</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.autoFixable && onApplySuggestion && (
                    <Button
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion.id)}
                      className="ml-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function groupIssuesBySeverity(issues: ValidationIssue[]) {
  return {
    critical: issues.filter((i) => i.severity.level === 'critical'),
    errors: issues.filter((i) => i.severity.level === 'error'),
    warnings: issues.filter((i) => i.severity.level === 'warning'),
    info: issues.filter((i) => i.severity.level === 'info'),
  }
}
