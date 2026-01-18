import * as React from 'react'
import { Plus, RefreshCw, AlertTriangle, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ImportAnalysis } from '@tiny-till/types'
import { generateChangeSummary } from '@tiny-till/types'

export interface ImportChangeSummaryProps {
  analysis: ImportAnalysis
}

export function ImportChangeSummary({ analysis }: ImportChangeSummaryProps) {
  const summary = generateChangeSummary(analysis)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-muted-foreground">New Products</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.adds}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-muted-foreground">Updates</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.updates}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-muted-foreground">Conflicts</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.conflicts}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-gray-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-muted-foreground">Unchanged</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.unchanged}</p>
        </CardContent>
      </Card>
    </div>
  )
}
