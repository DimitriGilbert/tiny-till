import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleContextValue {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(
  undefined
)

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error('Collapsible components must be used within a Collapsible')
  }
  return context
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, defaultOpen = false, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
      },
      [controlledOpen, onOpenChange]
    )

    return (
      <CollapsibleContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
        <div ref={ref} className={cn('', className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, onOpenChange } = useCollapsibleContext()

  return (
    <button
      type="button"
      ref={ref}
      aria-expanded={isOpen}
      onClick={() => onOpenChange(!isOpen)}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left bg-transparent border-0 p-0 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useCollapsibleContext()

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden text-sm transition-all animate-in slide-in-from-top-2 duration-200',
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
