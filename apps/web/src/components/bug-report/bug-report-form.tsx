import { Bug, Camera, File, Info, Send, X, AlertTriangle } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { FeedbackSeverity, FeedbackCategory } from '@/stores/feedback-store'

export interface BugReportFormProps {
  onSubmit: (data: BugReportData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

export interface BugReportData {
  subject: string
  description: string
  stepsToReproduce: string
  expectedBehavior: string
  actualBehavior: string
  severity: FeedbackSeverity
  category: FeedbackCategory
  includeEnvironmentData: boolean
  attachments: Array<File & { uid?: string }>
}

export function BugReportForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: BugReportFormProps) {
  const [formData, setFormData] = React.useState<BugReportData>({
    subject: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    category: 'other',
    includeEnvironmentData: true,
    attachments: [],
  })

  const [errors, setErrors] = React.useState<Partial<Record<keyof BugReportData, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof BugReportData, boolean>>>({})

  const handleInputChange = (field: keyof BugReportData, value: string | boolean | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof BugReportData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const validateField = (field: keyof BugReportData): string | undefined => {
    switch (field) {
      case 'subject':
        if (!formData.subject.trim()) return 'Subject is required'
        if (formData.subject.length > 100) return 'Subject must be 100 characters or less'
        break
      case 'description':
        if (!formData.description.trim()) return 'Description is required'
        if (formData.description.length < 20) return 'Description must be at least 20 characters'
        if (formData.description.length > 2000) return 'Description must be 2000 characters or less'
        break
      case 'stepsToReproduce':
        if (!formData.stepsToReproduce.trim()) return 'Steps to reproduce are required'
        break
      case 'expectedBehavior':
        if (!formData.expectedBehavior.trim()) return 'Expected behavior is required'
        break
      case 'actualBehavior':
        if (!formData.actualBehavior.trim()) return 'Actual behavior is required'
        break
    }
    return undefined
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BugReportData, string>> = {}

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof BugReportData)
      if (error) {
        newErrors[key as keyof BugReportData] = error
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith('image/') || file.type === 'text/plain'
      const isValidSize = file.size <= 5 * 1024 * 1024
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        attachments: 'Some files were rejected. Only images (max 5MB) are allowed.',
      }))
    }

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles.map((file) => ({ ...file, uid: crypto.randomUUID() }))],
    }))
  }

  const removeAttachment = (uid: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.uid !== uid && (!f.uid && f.name !== uid)),
    }))
  }

  const severityColors = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-green-500 text-white',
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800">
        <div className="p-2 rounded-lg bg-red-500">
          <Bug className="size-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Report a Bug
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us fix issues by providing detailed information
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            onBlur={() => handleBlur('subject')}
            placeholder="Brief description of the bug"
            maxLength={100}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
              'transition-all duration-200',
              errors.subject && 'border-red-500 dark:border-red-400'
            )}
          />
          {errors.subject && touched.subject && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="size-4" />
              {errors.subject}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.subject.length} / 100
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Describe what happened..."
            rows={4}
            maxLength={2000}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
              'transition-all duration-200',
              errors.description && 'border-red-500 dark:border-red-400'
            )}
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="size-4" />
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {formData.description.length} / 2000
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Steps to Reproduce <span className="text-red-500">*</span>
            </label>
            <textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
              onBlur={() => handleBlur('stepsToReproduce')}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={5}
              className={cn(
                'w-full px-4 py-2 rounded-lg border-2',
                'bg-white dark:bg-gray-800',
                'border-gray-300 dark:border-gray-600',
                'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
                'transition-all duration-200',
                errors.stepsToReproduce && 'border-red-500 dark:border-red-400'
              )}
            />
            {errors.stepsToReproduce && touched.stepsToReproduce && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="size-4" />
                {errors.stepsToReproduce}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Behavior <span className="text-red-500">*</span>
              </label>
              <textarea
                id="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                onBlur={() => handleBlur('expectedBehavior')}
                placeholder="What you expected to happen..."
                rows={3}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-800',
                  'border-gray-300 dark:border-gray-600',
                  'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
                  'transition-all duration-200',
                  errors.expectedBehavior && 'border-red-500 dark:border-red-400'
                )}
              />
              {errors.expectedBehavior && touched.expectedBehavior && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {errors.expectedBehavior}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actual Behavior <span className="text-red-500">*</span>
              </label>
              <textarea
                id="actualBehavior"
                value={formData.actualBehavior}
                onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                onBlur={() => handleBlur('actualBehavior')}
                placeholder="What actually happened..."
                rows={3}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-800',
                  'border-gray-300 dark:border-gray-600',
                  'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
                  'transition-all duration-200',
                  errors.actualBehavior && 'border-red-500 dark:border-red-400'
                )}
              />
              {errors.actualBehavior && touched.actualBehavior && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {errors.actualBehavior}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value as FeedbackSeverity)}
              className={cn(
                'w-full px-4 py-2 rounded-lg border-2',
                'bg-white dark:bg-gray-800',
                'border-gray-300 dark:border-gray-600',
                'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
                'transition-all duration-200'
              )}
            >
              <option value="critical">Critical - App unusable</option>
              <option value="high">High - Major functionality broken</option>
              <option value="medium">Medium - Workaround exists</option>
              <option value="low">Low - Minor annoyance</option>
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
                'focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20',
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

        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Attachments (Screenshots, Logs)
          </label>
          <div className="space-y-2">
            <label className={cn(
              'flex items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed',
              'bg-gray-50 dark:bg-gray-800/50',
              'border-gray-300 dark:border-gray-600',
              'hover:border-pink-500 dark:hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20',
              'cursor-pointer transition-all duration-200'
            )}>
              <input
                type="file"
                id="attachments"
                multiple
                accept="image/*,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Camera className="size-8 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to attach files or drag and drop
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Images (max 5MB each)
                </span>
              </div>
            </label>

            {errors.attachments && (
              <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="size-4" />
                {errors.attachments}
              </p>
            )}

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={file.uid || `${file.name}-${index}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <File className="size-4 text-pink-500" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.uid || `${file.name}-${index}`)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <X className="size-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
          <input
            type="checkbox"
            id="includeEnvironmentData"
            checked={formData.includeEnvironmentData}
            onChange={(e) => handleInputChange('includeEnvironmentData', e.target.checked)}
            className="mt-1 size-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
          />
          <div>
            <label htmlFor="includeEnvironmentData" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include Environment Data
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Automatically captures browser, device, and settings information to help us reproduce the issue.
            </p>
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
          className="min-h-[44px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit Bug Report
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
