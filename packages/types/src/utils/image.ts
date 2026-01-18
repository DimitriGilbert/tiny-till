export const MAX_IMAGE_WIDTH = 128
export const MAX_IMAGE_HEIGHT = 128
export const MIN_IMAGE_SIZE = 32
export const MAX_IMAGE_SIZE_BYTES = 65536
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]

export interface ImageDimensions {
  width: number
  height: number
}

export type ImageValidationError =
  | { type: 'INVALID_MIME_TYPE'; message: string }
  | { type: 'FILE_TOO_LARGE'; message: string; fileSize: number }
  | { type: 'DIMENSIONS_TOO_LARGE'; message: string; dimensions: ImageDimensions }
  | { type: 'DIMENSIONS_TOO_SMALL'; message: string; dimensions: ImageDimensions }
  | { type: 'CORRUPT_IMAGE'; message: string }
  | { type: 'ENCODING_ERROR'; message: string }

export interface ImageValidationResult {
  valid: boolean
  error?: ImageValidationError
  dimensions?: ImageDimensions
}

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/webp' | 'image/jpeg' | 'image/png'
}
