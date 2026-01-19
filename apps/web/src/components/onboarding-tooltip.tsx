import * as React from 'react'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from '@/stores/onboarding-store'

export interface OnboardingTooltipProps {
  step: OnboardingStep
  currentIndex: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onClose: () => void
  isOpen: boolean
}

export function OnboardingTooltip({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  isOpen,
}: OnboardingTooltipProps) {
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          onPrevious()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [isOpen, onNext, onPrevious, onClose]
  )

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  React.useEffect(() => {
    if (isOpen && tooltipRef.current) {
      tooltipRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border bg-background p-4 shadow-lg',
        'animate-in fade-in zoom-in-95 duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3
            id="onboarding-title"
            className="text-base font-semibold text-foreground"
          >
            {step.title}
          </h3>
          <div className="mt-1 text-xs text-muted-foreground">
            Step {currentIndex + 1} of {totalSteps}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Close tour"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <p
        id="onboarding-description"
        className="mb-4 text-sm leading-relaxed text-muted-foreground"
      >
        {step.description}
      </p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Previous
            </button>
          )}

          {step.action ? (
            <button
              type="button"
              onClick={isLastStep ? onSkip : onNext}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {step.action}
            </button>
          ) : (
            <button
              type="button"
              onClick={isLastStep ? onSkip : onNext}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {step.title}: {step.description}
      </div>
    </div>
  )
}
