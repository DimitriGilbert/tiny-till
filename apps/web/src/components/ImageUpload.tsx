import * as React from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ImageValidationError } from '@tiny-till/types'
import {
  validateImageFile,
  compressImageWithFallback,
  encodeBase64,
  ACCEPTED_MIME_TYPES,
  autoSelectFormat,
} from '@tiny-till/types'
import { toast } from 'sonner'
import { useStorageStore } from '@/stores/storage-store'
import { showQuotaExceeded } from '@/lib/storage-toasts'

interface ImageUploadProps {
  value?: string | null
  onChange: (value: string | null) => void
  onValidationError?: (error: ImageValidationError) => void
  disabled?: boolean
  className?: string
  label?: string
  helpText?: string
}

export function ImageUpload({
  value,
  onChange,
  onValidationError,
  disabled = false,
  className,
  label = 'Product Image',
  helpText = 'Max size: 128×128 pixels. Formats: PNG, JPEG, WebP, AVIF',
}: ImageUploadProps) {
  const { storageInfo, checkStorage } = useStorageStore()
  const [isDragging, setIsDragging] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [previewUrl, setPreviewUrl] = React.useState<string>()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (value) {
      setPreviewUrl(value)
    } else {
      setPreviewUrl(undefined)
    }
  }, [value])

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const checkAvailableStorage = (): boolean => {
    if (!storageInfo) return true

    const imageEstimate = 20 * 1024
    const availableSpace = storageInfo.quotaLimit - storageInfo.quotaUsed

    return availableSpace > imageEstimate * 2
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(undefined)

    try {
      const validation = await validateImageFile(file)

      if (!validation.valid) {
        const errorMsg = validation.error?.message || 'Invalid image'
        setError(errorMsg)
        if (validation.error && onValidationError) {
          onValidationError(validation.error)
        }
        toast.error('Image Error', { description: errorMsg })
        setIsProcessing(false)
        return
      }

      if (!checkAvailableStorage()) {
        setError('Storage is nearly full. Please free up space first.')
        toast.error('Storage Full', {
          description: 'Please free up space before uploading images',
        })
        showQuotaExceeded()
        setIsProcessing(false)
        return
      }

      const preferredFormat = await autoSelectFormat()
      const originalSize = file.size
      const compressedBlob = await compressImageWithFallback(file, {
        maxWidth: 128,
        maxHeight: 128,
        quality: 0.8,
        format: preferredFormat,
      })

      const compressedSize = compressedBlob.size
      if (compressedSize < originalSize) {
        const savings = ((originalSize - compressedSize) / originalSize) * 100
        toast.success('Image Optimized', {
          description: `Compressed from ${(originalSize / 1024).toFixed(1)}KB to ${(compressedSize / 1024).toFixed(1)}KB (${savings.toFixed(0)}% smaller)`,
        })
      }

      const base64 = await encodeBase64(compressedBlob)
      onChange(base64)

      await checkStorage()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process image'
      setError(errorMsg)
      toast.error('Processing Error', { description: errorMsg })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isProcessing) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || isProcessing) return

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(undefined)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-start gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            {isProcessing ? (
              <div className="flex size-32 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="size-32 object-cover rounded-none"
                />
                <Button
                  size="icon-xs"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="absolute -top-2 -right-2"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <button
                ref={dropZoneRef}
                type="button"
                onClick={handleClick}
                disabled={disabled || isProcessing}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'flex size-32 flex-col items-center justify-center rounded-none border-2 border-dashed transition-all duration-200',
                  isDragging
                    ? 'border-primary bg-primary/10 scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload
                  className={cn(
                    'mb-2 transition-transform',
                    isDragging ? 'scale-110 text-primary' : 'text-muted-foreground'
                  )}
                  size={28}
                />
                <span className="text-xs text-muted-foreground text-center px-1">
                  {isDragging ? 'Drop image here' : 'Click or drag image'}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MIME_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload image file"
            />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-1 text-xs max-w-[150px]">
          <p className="text-muted-foreground">{helpText}</p>
          {error && (
            <p className="text-destructive font-medium" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
