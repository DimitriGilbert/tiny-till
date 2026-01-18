import { toast } from 'sonner'
import { Check } from 'lucide-react'

interface ShowSettingsSuccessOptions {
  setting: string
  value: string
  description?: string
  duration?: number
}

export function showSettingsSuccess({
  setting,
  value,
  description,
  duration = 3000,
}: ShowSettingsSuccessOptions) {
  return toast.success(
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <Check className="size-3 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{setting}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium text-primary">{value}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>,
    {
      duration,
    }
  )
}

export function showSettingsResetSuccess() {
  return toast.success(
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <Check className="size-3 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1">
        <div className="font-medium">Settings Reset</div>
        <p className="text-sm text-muted-foreground">
          All settings have been restored to their default values
        </p>
      </div>
    </div>,
    {
      duration: 3000,
    }
  )
}
