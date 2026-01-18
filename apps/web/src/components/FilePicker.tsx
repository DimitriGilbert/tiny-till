import * as React from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FilePickerProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  allowedExtensions?: string[]
  disabled?: boolean
  className?: string
  label?: string
  helpText?: string
  error?: string
  fileName?: string
  processing?: boolean
}

export function FilePicker({
  onFileSelect,
  accept = '.json',
  maxSize = 10 * 1024 * 1024,
  allowedExtensions = ['.json'],
  disabled = false,
  className,
  label = 'Upload File',
  helpText = 'Upload a JSON file',
  error,
  fileName,
  processing = false,
}: FilePickerProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFileName, setSelectedFileName] = React.useState<string>()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (fileName) {
      setSelectedFileName(fileName)
    }
  }, [fileName])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !processing) {
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

    if (disabled || processing) return

    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFileName(file.name)
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled && !processing) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      onFileSelect(file)
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

  const handleClear = () => {
    setSelectedFileName(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-sm font-medium">{label}</span>
      <Card>
        <CardContent className="p-4">
          {processing ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing file...</span>
              </div>
            </div>
          ) : selectedFileName ? (
            <div className="flex items-center gap-3 min-h-[120px]">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFileName}</p>
                <p className="text-xs text-muted-foreground">File selected successfully</p>
              </div>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleClear}
                disabled={disabled}
                aria-label="Clear file selection"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              ref={dropZoneRef}
              type="button"
              onClick={handleClick}
              disabled={disabled || processing}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex flex-col items-center justify-center min-h-[120px] rounded-none border-2 border-dashed transition-all duration-200',
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-destructive bg-destructive/5'
              )}
              aria-label={label}
            >
              <Upload
                className={cn(
                  'mb-2 transition-transform',
                  isDragging ? 'scale-110 text-primary' : 'text-muted-foreground'
                )}
                size={28}
              />
              <span className="text-sm font-medium text-center px-2 mb-1">
                {isDragging ? 'Drop file here' : 'Click or drag to upload'}
              </span>
              <span className="text-xs text-muted-foreground text-center px-2">
                {allowedExtensions.join(', ')}
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">{helpText}</p>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
