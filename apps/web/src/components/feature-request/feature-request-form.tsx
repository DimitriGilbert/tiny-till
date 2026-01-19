import { Lightbulb, Send, X, TrendingUp, Star } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { FeedbackPriority, FeedbackCategory } from '@/stores/feedback-store'

export interface FeatureRequestFormProps {
  onSubmit: (data: FeatureRequestData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

export interface FeatureRequestData {
  title: string
  description: string
  useCase: string
  priority: FeedbackPriority
  category: FeedbackCategory
  attachments: File[]
}

export function FeatureRequestForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: FeatureRequestFormProps) {
  const [formData, setFormData] = React.useState<FeatureRequestData>({
    title: '',
    description: '',
    useCase: '',
    priority: 'nice-to-have',
    category: 'feature',
    attachments: [],
  })

  const [errors, setErrors] = React.useState<Partial<Record<keyof FeatureRequestData, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof FeatureRequestData, boolean>>>({})

  const handleInputChange = (field: keyof FeatureRequestData, value: string | boolean | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof FeatureRequestData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const validateField = (field: keyof FeatureRequestData): string | undefined => {
    switch (field) {
      case 'title':
        if (!formData.title.trim()) return 'Title is required'
        if (formData.title.length > 100) return 'Title must be 100 characters or less'
        break
      case 'description':
        if (!formData.description.trim()) return 'Description is required'
        if (formData.description.length < 50) return 'Description must be at least 50 characters'
        if (formData.description.length > 2000) return 'Description must be 2000 characters or less'
        break
      case 'useCase':
        if (!formData.useCase.trim()) return 'Use case is required'
        if (formData.useCase.length > 1000) return 'Use case must be 1000 characters or less'
        break
    }
    return undefined
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FeatureRequestData, string>> = {}

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FeatureRequestData)
      if (error) {
        newErrors[key as keyof FeatureRequestData] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit(formData)
  }

  const priorityColors = {
    critical: 'bg-red-500 text-white',
    important: 'bg-orange-500 text-white',
    'nice-to-have': 'bg-green-500 text-white',
  }

  const priorityLabels = {
    critical: 'Critical - Essential for my workflow',
    important: 'Important - Would significantly improve my experience',
    'nice-to-have': 'Nice to have - Would be a nice bonus',
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="p-2 rounded-lg bg-blue-500">
          <Lightbulb className="size-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Request a Feature
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your ideas to make Tiny-Till better
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feature Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            placeholder="Brief title for your feature"
            maxLength={100}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20',
              'transition-all duration-200',
              errors.title && 'border-red-500 dark:border-red-400'
            )}
          />
          {errors.title && touched.title && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              <Star className="size-4" />
              {errors.title}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.title.length} / 100
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feature Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Describe what this feature should do..."
            rows={6}
            maxLength={2000}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20',
              'transition-all duration-200',
              errors.description && 'border-red-500 dark:border-red-400'
            )}
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              <Star className="size-4" />
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.description.length} / 2000
          </p>
        </div>

        <div>
          <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Use Case <span className="text-red-500">*</span>
          </label>
          <textarea
            id="useCase"
            value={formData.useCase}
            onChange={(e) => handleInputChange('useCase', e.target.value)}
            onBlur={() => handleBlur('useCase')}
            placeholder="Explain how you would use this feature and why it's important..."
            rows={4}
            maxLength={1000}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20',
              'transition-all duration-200',
              errors.useCase && 'border-red-500 dark:border-red-400'
            )}
          />
          {errors.useCase && touched.useCase && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              <Star className="size-4" />
              {errors.useCase}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.useCase.length} / 1000
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as FeedbackPriority)}
              className={cn(
                'w-full px-4 py-2 rounded-lg border-2',
                'bg-white dark:bg-gray-800',
                'border-gray-300 dark:border-gray-600',
                'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20',
                'transition-all duration-200'
              )}
            >
              <option value="nice-to-have">Nice to have</option>
              <option value="important">Important</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as FeedbackCategory)}
              className={cn(
                'w-full px-4 py-2 rounded-lg border-2',
                'bg-white dark:bg-gray-800',
                'border-gray-300 dark:border-gray-600',
                'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20',
                'transition-all duration-200'
              )}
            >
              <option value="ui-ux">UI/UX</option>
              <option value="performance">Performance</option>
              <option value="feature">Feature</option>
              <option value="documentation">Documentation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <TrendingUp className="size-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                Why the Use Case Matters
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Understanding how you'd use this feature helps us prioritize and design it effectively.
                Be specific about your workflow and the problems this would solve.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit Feature Request
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
