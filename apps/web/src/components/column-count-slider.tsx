import * as React from 'react'

import { cn } from '@/lib/utils'

interface ColumnCountSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function ColumnCountSlider({
  value,
  onChange,
  min = 2,
  max = 8,
  disabled = false,
  className,
}: ColumnCountSliderProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(event.target.value, 10)
    setLocalValue(newValue)

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, 150)
  }

  const percentage = ((localValue - min) / (max - min)) * 100

  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className={cn('relative w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="column-count-slider" className="text-xs font-medium">
          Columns: <span className="text-base font-bold text-accent">{localValue}</span>
        </label>
      </div>

      <div className="relative">
        <input
          id="column-count-slider"
          type="range"
          min={min}
          max={max}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={`Column count: ${localValue}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
          className={cn(
            'relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent focus:outline-none',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-ring',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110',
            '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted',
            '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-2 rounded-full bg-muted"
          style={{
            background: `linear-gradient(to right, hsl(var(--accent)) ${percentage}%, hsl(var(--muted)) ${percentage}%)`,
          }}
        />
      </div>

      <div className="relative mt-1 flex justify-between px-1">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="flex flex-col items-center"
            style={{ width: `${100 / ticks.length}%` }}
          >
            <div
              className={cn(
                'h-1 w-0.5 rounded-full bg-muted-foreground/50',
                tick === localValue && 'bg-accent h-2'
              )}
            />
            <span
              className={cn(
                'mt-1 text-xs text-muted-foreground',
                tick === localValue && 'font-semibold text-accent'
              )}
            >
              {tick}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
