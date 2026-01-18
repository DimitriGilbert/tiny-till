import * as React from 'react'
import { ChevronDown, ChevronRight, Plus, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductFieldComparison } from '@/components/ProductFieldComparison'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProductChange, ConflictResolutionStrategy } from '@tiny-till/types'

export interface ProductChangeCardProps {
  change: ProductChange
  expanded?: boolean
  onToggleExpand?: () => void
  onSelectChange?: (selected: boolean) => void
  selected?: boolean
  selectedStrategy?: ConflictResolutionStrategy
  onStrategyChange?: (strategy: ConflictResolutionStrategy) => void
  isConflicting?: boolean
}

export function ProductChangeCard({
  change,
  expanded = false,
  onToggleExpand,
  onSelectChange,
  selected = true,
  selectedStrategy,
  onStrategyChange,
  isConflicting = false,
}: ProductChangeCardProps) {
  const changeTypeConfig = {
    add: {
      icon: Plus,
      label: 'New Product',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800/50',
    },
    update: {
      icon: RefreshCw,
      label: 'Update',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800/50',
    },
    conflict: {
      icon: AlertTriangle,
      label: 'Conflict',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800/50',
    },
    unchanged: {
      icon: Check,
      label: 'Unchanged',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-800/50',
    },
  }

  const config = changeTypeConfig[change.changeType]
  const Icon = config.icon

  const handleCheckboxChange = (checked: boolean) => {
    onSelectChange?.(checked)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggleExpand?.()
    }
  }

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        config.borderColor
      } ${expanded ? 'bg-muted/30' : 'bg-background'}`}
    >
      <button
        type="button"
        className="flex items-center gap-3 p-3 w-full text-left cursor-pointer hover:bg-muted/50 transition-colors border-0 bg-transparent"
        onClick={(e) => {
          const target = e.target as HTMLElement
          const isCheckbox = target.closest('[role="checkbox"]') !== null
          if (!isCheckbox) {
            onToggleExpand?.()
          }
        }}
        onKeyDown={handleKeyDown}
        aria-expanded={expanded}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${change.newProduct.name} for import`}
          className="flex-shrink-0"
        />

        <div
          className={`p-2 rounded-full ${config.color} flex-shrink-0`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{change.newProduct.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            ID: {change.productId.slice(0, 8)}...
          </p>
        </div>

        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>

        {change.changedFields && change.changedFields.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {change.changedFields.length} field{change.changedFields.length > 1 ? 's' : ''} changed
          </Badge>
        )}

        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-3">
          <ProductFieldComparison
            existing={change.existingProduct}
            incoming={change.newProduct}
            changedFields={change.changedFields}
          />
        </div>
      )}

      {change.isConflict && isConflicting && (
        <div className="border-t border-border p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Resolution Strategy
          </p>
          <Select
            value={selectedStrategy || 'skip'}
            onValueChange={(value) => {
              if (value === 'merge' || value === 'replace' || value === 'skip') {
                onStrategyChange?.(value)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge - Combine fields from both</SelectItem>
              <SelectItem value="replace">Replace - Use imported data</SelectItem>
              <SelectItem value="skip">Skip - Keep existing data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
