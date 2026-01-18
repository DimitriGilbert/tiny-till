import * as React from 'react'
import { CheckCircle2, XCircle, Image as ImageIcon, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@tiny-till/types'

export interface ProductFieldComparisonProps {
  existing: Product | undefined
  incoming: Product
  changedFields?: string[]
}

export function ProductFieldComparison({
  existing,
  incoming,
  changedFields,
}: ProductFieldComparisonProps) {
  const isFieldChanged = (fieldName: string) => {
    return changedFields?.includes(fieldName) || false
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const FieldRow = ({
    label,
    existingValue,
    incomingValue,
    isChanged,
    type = 'text',
  }: {
    label: string
    existingValue?: string | number
    incomingValue: string | number
    isChanged: boolean
    type?: 'text' | 'image' | 'price' | 'timestamp'
  }) => (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-2 py-2 px-3 rounded-md text-sm ${
        isChanged ? 'bg-muted/50' : ''
      }`}
    >
      <div className="font-medium text-muted-foreground flex items-center gap-1.5">
        {type === 'image' && <ImageIcon className="h-3.5 w-3.5" />}
        {type === 'price' && <span className="text-lg leading-none">$</span>}
        {label}
      </div>
      <div className="text-muted-foreground min-w-0 truncate">
        {existingValue !== undefined ? (
          <>
            {isChanged && <span className="line-through mr-1">{existingValue}</span>}
            {!isChanged && existingValue}
          </>
        ) : (
          <span className="text-muted-foreground/50 italic">N/A</span>
        )}
      </div>
      <div className="font-medium min-w-0 truncate">
        {isChanged && <CheckCircle2 className="inline h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-1" />}
        {incomingValue}
      </div>
    </div>
  )

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-3">Field Comparison</div>

      <FieldRow
        label="Name"
        existingValue={existing?.name}
        incomingValue={incoming.name}
        isChanged={isFieldChanged('name')}
      />

      <FieldRow
        label="Price"
        existingValue={existing ? formatPrice(existing.price) : undefined}
        incomingValue={formatPrice(incoming.price)}
        isChanged={isFieldChanged('price')}
        type="price"
      />

      <FieldRow
        label="Image"
        existingValue={existing?.imageData ? 'Yes' : undefined}
        incomingValue={incoming.imageData ? 'Yes' : 'No'}
        isChanged={isFieldChanged('imageData')}
        type="image"
      />

      {isFieldChanged('imageData') && existing?.imageData && incoming.imageData && (
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-2 py-2 px-3 rounded-md bg-muted/50">
          <div className="font-medium text-muted-foreground sm:col-span-3">Image Preview</div>
          <div className="sm:col-span-1 text-right text-xs text-muted-foreground pt-1">Existing:</div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <img
              src={existing.imageData}
              alt={`Existing product image: ${existing.name}`}
              className="w-12 h-12 object-cover rounded border"
            />
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <img
              src={incoming.imageData}
              alt={`Incoming product image: ${incoming.name}`}
              className="w-12 h-12 object-cover rounded border"
            />
            <Badge variant="destructive" className="ml-auto text-xs">
              Changed
            </Badge>
          </div>
        </div>
      )}

      <FieldRow
        label="Created"
        existingValue={existing ? formatTimestamp(existing.createdAt) : undefined}
        incomingValue={formatTimestamp(incoming.createdAt)}
        isChanged={isFieldChanged('createdAt')}
        type="timestamp"
      />

      <FieldRow
        label="Updated"
        existingValue={existing ? formatTimestamp(existing.updatedAt) : undefined}
        incomingValue={formatTimestamp(incoming.updatedAt)}
        isChanged={isFieldChanged('updatedAt')}
        type="timestamp"
      />
    </div>
  )
}
