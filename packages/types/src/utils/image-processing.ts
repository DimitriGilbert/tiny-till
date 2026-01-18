import type {
  AcceptedMimeType,
  ImageCompressionOptions,
  ImageDimensions,
  ImageValidationResult,
} from './image'
import type {
  ImageFormatSupport,
  PreferredFormat,
} from './storage'
import {
  ACCEPTED_MIME_TYPES,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_WIDTH,
  MIN_IMAGE_SIZE,
} from './image'
import {
  getBestSupportedFormat,
  getFallbackFormats,
} from './image-support'

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as AcceptedMimeType)) {
    return {
      valid: false,
      error: {
        type: 'INVALID_MIME_TYPE',
        message: 'Please upload PNG, JPEG, or WebP images only',
      },
    }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: {
        type: 'FILE_TOO_LARGE',
        message: `Image is ${(file.size / 1024).toFixed(0)}KB. Maximum allowed size is 64KB`,
        fileSize: file.size,
      },
    }
  }

  try {
    const dimensions = await getImageDimensions(file)

    if (dimensions.width === 0 || dimensions.height === 0) {
      return {
        valid: false,
        error: {
          type: 'CORRUPT_IMAGE',
          message: 'Unable to read image file. Please try a different file',
        },
      }
    }

    if (dimensions.width > MAX_IMAGE_WIDTH || dimensions.height > MAX_IMAGE_HEIGHT) {
      return {
        valid: false,
        error: {
          type: 'DIMENSIONS_TOO_LARGE',
          message: `Image is ${dimensions.width}×${dimensions.height} pixels. Maximum allowed is ${MAX_IMAGE_WIDTH}×${MAX_IMAGE_HEIGHT}`,
          dimensions,
        },
      }
    }

    if (dimensions.width < MIN_IMAGE_SIZE || dimensions.height < MIN_IMAGE_SIZE) {
      return {
        valid: false,
        error: {
          type: 'DIMENSIONS_TOO_SMALL',
          message: `Image is ${dimensions.width}×${dimensions.height} pixels. Minimum recommended size is ${MIN_IMAGE_SIZE}×${MIN_IMAGE_SIZE}`,
          dimensions,
        },
      }
    }

    return {
      valid: true,
      dimensions,
    }
  } catch (error) {
    return {
      valid: false,
      error: {
        type: 'CORRUPT_IMAGE',
        message: 'Unable to read image file. Please try a different file',
      },
    }
  }
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = MAX_IMAGE_WIDTH,
    maxHeight = MAX_IMAGE_HEIGHT,
    quality = 0.8,
    format = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to create canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }
          resolve(blob)
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export async function encodeBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result.startsWith('data:')) {
        resolve(result)
      } else {
        reject(new Error('Invalid data URL format'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to encode image as Base64'))
    }
    reader.readAsDataURL(file)
  })
}

export function decodeBase64(base64: string): Blob | null {
  try {
    const match = base64.match(/^data:(.*?);base64,(.*)$/)
    if (!match) {
      return null
    }

    const mimeType = match[1]
    const base64Data = match[2]
    if (!base64Data) return null
    const byteCharacters = atob(base64Data)
    const byteArrays: BlobPart[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers as number[])
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  } catch {
    return null
  }
}

export function calculateImageQuality(originalSize: number, targetSize: number): number {
  if (originalSize <= targetSize) {
    return 1.0
  }

  const ratio = targetSize / originalSize
  const quality = Math.max(0.5, Math.min(0.95, Math.sqrt(ratio)))

  return quality
}

export function isSupportedFormat(mimeType: string): mimeType is AcceptedMimeType {
  return ACCEPTED_MIME_TYPES.includes(mimeType as AcceptedMimeType)
}

export async function compressImageWithFallback(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = MAX_IMAGE_WIDTH,
    maxHeight = MAX_IMAGE_HEIGHT,
    quality = 0.8,
  } = options

  const preferredFormat = options.format ?? (await getBestSupportedFormat())
  const fallbackFormats = getFallbackFormats(preferredFormat)

  try {
    return await compressImage(file, {
      maxWidth,
      maxHeight,
      quality,
      format: preferredFormat,
    })
  } catch (error) {
    console.warn(`[Image] Failed to compress as ${preferredFormat}, trying fallback`, error)

    for (const fallbackFormat of fallbackFormats) {
      try {
        return await compressImage(file, {
          maxWidth,
          maxHeight,
          quality,
          format: fallbackFormat,
        })
      } catch (fallbackError) {
        console.warn(`[Image] Failed to compress as ${fallbackFormat}`, fallbackError)
      }
    }

    throw new Error('Failed to compress image with any supported format')
  }
}

export async function getOptimalFormat(
  imageSupport?: ImageFormatSupport
): Promise<PreferredFormat> {
  if (imageSupport) {
    return imageSupport.preferred
  }

  const detected = await getBestSupportedFormat()
  return detected
}

export async function autoSelectFormat(): Promise<PreferredFormat> {
  const bestFormat = await getBestSupportedFormat()
  return bestFormat
}
