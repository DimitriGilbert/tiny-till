import * as React from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface OnboardingHint {
  id: string
  icon: string
  title: string
  description: string
}

export interface OnboardingHintToastProps {
  hint: OnboardingHint
  onDismiss: () => void
  onDontShowAgain?: () => void
}

export function showOnboardingHint(hint: OnboardingHint, options?: {
  onDontShowAgain?: () => void
}) {
  const toastId = toast.success(
    <div className="flex items-start gap-3">
      <span className="text-2xl" role="img" aria-hidden="true">
        {hint.icon}
      </span>
      <div className="flex-1">
        <div className="font-semibold text-foreground">{hint.title}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {hint.description}
        </div>
      </div>
    </div>,
    {
      id: `hint-${hint.id}`,
      duration: 8000,
      position: 'bottom-center',
      action: options?.onDontShowAgain ? {
        label: 'Don\'t show again',
        onClick: () => {
          options.onDontShowAgain?.()
          toast.dismiss(toastId)
        },
      } : undefined,
      onDismiss: () => {
        console.log(`Hint ${hint.id} dismissed`)
      },
    }
  )

  return { toastId }
}

export function OnboardingHintToast({ hint, onDismiss }: OnboardingHintToastProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border bg-background shadow-lg',
      'animate-in slide-in-from-bottom-4 fade-in duration-300'
    )}>
      <span className="text-2xl shrink-0" role="img" aria-hidden="true">
        {hint.icon}
      </span>
      <div className="flex-1">
        <div className="font-semibold text-foreground">{hint.title}</div>
        <p className="text-sm text-muted-foreground mt-1">
          {hint.description}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss hint"
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
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  )
}
