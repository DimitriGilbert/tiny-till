import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function FeedbackDialog({
  isOpen,
  onClose,
  title,
  children,
  className,
}: FeedbackDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      dialogRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          'relative z-[51] w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'm-4 rounded-2xl shadow-2xl',
          'bg-white dark:bg-gray-900',
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-200',
          'focus:outline-none focus:ring-4 focus:ring-pink-500/50',
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2
            id="dialog-title"
            className="text-xl font-bold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Close dialog"
          >
            <X className="size-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
