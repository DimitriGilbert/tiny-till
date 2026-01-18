import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: '24', description: 'Remind if no backup in 24 hours' },
  {
    label: 'Weekly',
    value: '168',
    description: 'Remind if no backup in 1 week',
  },
  {
    label: 'Bi-weekly',
    value: '336',
    description: 'Remind if no backup in 2 weeks',
  },
  {
    label: 'Monthly',
    value: '720',
    description: 'Remind if no backup in 30 days',
  },
  {
    label: 'Never',
    value: '-1',
    description: "Don't remind about backups",
  },
] as const

export interface BackupFrequencySelectProps {
  value: number
  onChange: (value: number) => void
}

export function BackupFrequencySelect({
  value,
  onChange,
}: BackupFrequencySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="backup-frequency">Reminder Frequency</Label>
      <Select
        value={value.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="backup-frequency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
