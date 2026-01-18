import * as React from 'react'
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { animationClasses } from '@/lib/animations'
import { VALIDATION_TYPES } from '@/lib/validation-messages'

export type FormValidationSummaryVariant = 'compact' | 'detailed'

export interface FormValidationSummaryProps {
  errors: Map<string, string>
  warnings: Map<string, string>
  onFocusField?: (fieldName: string) => void
  dismissible?: boolean
  variant?: FormValidationSummaryVariant
  className?: string
}

export const FormValidationSummary = React.memo(function FormValidationSummary({
  errors,
  warnings,
  onFocusField,
  dismissible = false,
  variant = 'compact',
  className,
}: FormValidationSummaryProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [dismissedItems, setDismissedItems] = React.useState<Set<string>>(new Set())
  const errorListRef = React.useRef<HTMLUListElement>(null)

  const errorEntries = Array.from(errors.entries()).filter(([key]) => !dismissedItems.has(key))
  const warningEntries = Array.from(warnings.entries()).filter(([key]) => !dismissedItems.has(key))

  const errorCount = errorEntries.length
  const warningCount = warningEntries.length
  const totalCount = errorCount + warningCount

  React.useEffect(() => {
    if (errorCount > 0 && isExpanded && errorListRef.current) {
      const firstError = errorListRef.current.querySelector('button')
      firstError?.focus()
    }
  }, [errorCount, isExpanded])

  const handleDismiss = (fieldName: string) => {
    setDismissedItems((prev) => new Set(prev).add(fieldName))
  }

  const handleFieldFocus = (fieldName: string) => {
    onFocusField?.(fieldName)
  }

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  if (totalCount === 0) {
    return null
  }

  const iconMap = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colorMap = {
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400',
  }

  const bgMap = {
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        errorCount > 0
          ? bgMap.error
          : warningCount > 0
            ? bgMap.warning
            : bgMap.info,
        animationClasses.springEnter,
        className
      )}
      role="region"
      aria-label={`${totalCount} validation ${totalCount === 1 ? 'issue' : 'issues'}`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {errorCount > 0 ? (
            <AlertCircle className={cn('h-5 w-5 flex-shrink-0', colorMap.error)} />
          ) : warningCount > 0 ? (
            <AlertTriangle className={cn('h-5 w-5 flex-shrink-0', colorMap.warning)} />
          ) : (
            <Info className={cn('h-5 w-5 flex-shrink-0', colorMap.info)} />
          )}
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className={cn('text-sm font-semibold', colorMap.error)}>
                {errorCount} error{errorCount > 1 ? 's' : ''}
              </span>
            )}
            {errorCount > 0 && warningCount > 0 && (
              <span className="text-gray-400 dark:text-gray-500">·</span>
            )}
            {warningCount > 0 && (
              <span className={cn('text-sm font-semibold', colorMap.warning)}>
                {warningCount} warning{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleExpanded}
            className={cn(
              'p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
              colorMap.error || colorMap.warning || colorMap.info
            )}
            aria-label={isExpanded ? 'Collapse validation summary' : 'Expand validation summary'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          className={cn(
            'border-t border-black/5 dark:border-white/10',
            animationClasses.fadeIn
          )}
        >
          {errorCount > 0 && (
            <ul ref={errorListRef} className="divide-y divide-black/5 dark:divide-white/10" role="list">
              {errorEntries.map(([fieldName, message], index) => {
                const Icon = iconMap.error
                return (
                  <li
                    key={fieldName}
                    className="flex items-start gap-3 p-3 hover:bg-black/2 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon
                      className={cn('h-4 w-4 mt-0.5 flex-shrink-0', colorMap.error)}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {fieldName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {onFocusField && (
                        <button
                          type="button"
                          onClick={() => handleFieldFocus(fieldName)}
                          className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-colors"
                        >
                          Focus
                        </button>
                      )}
                      {dismissible && (
                        <button
                          type="button"
                          onClick={() => handleDismiss(fieldName)}
                          className={cn(
                            'p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors',
                            colorMap.error
                          )}
                          aria-label={`Dismiss ${fieldName} error`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {errorCount > 0 && warningCount > 0 && (
            <div className="border-t border-black/5 dark:border-white/10 p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Warnings
              </div>
            </div>
          )}

          {warningEntries.length > 0 && (
            <ul className="divide-y divide-black/5 dark:divide-white/10" role="list">
              {warningEntries.map(([fieldName, message]) => {
                const Icon = iconMap.warning
                return (
                  <li
                    key={fieldName}
                    className="flex items-start gap-3 p-3 hover:bg-black/2 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon
                      className={cn('h-4 w-4 mt-0.5 flex-shrink-0', colorMap.warning)}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {fieldName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {onFocusField && (
                        <button
                          type="button"
                          onClick={() => handleFieldFocus(fieldName)}
                          className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-colors"
                        >
                          Focus
                        </button>
                      )}
                      {dismissible && (
                        <button
                          type="button"
                          onClick={() => handleDismiss(fieldName)}
                          className={cn(
                            'p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors',
                            colorMap.warning
                          )}
                          aria-label={`Dismiss ${fieldName} warning`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
})