import type {
  ImportValidationError,
  ImportValidationResult,
  ImportResult,
  ImportMetadata,
} from '../entities/import'
import {
  validateCatalogImport,
  validateJSONSyntax,
  checkFileStructure,
} from '../validation/import'
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
} from '../entities/import'

export async function parseJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result
        if (typeof content !== 'string') {
          reject(new Error('File content is not a string'))
          return
        }

        const json = JSON.parse(content)
        resolve(json)
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export function validateImportFile(data: unknown): ImportValidationResult {
  const structureCheck = checkFileStructure(data)

  if (!structureCheck.isValid) {
    return {
      isValid: false,
      errors: [
        {
          message: structureCheck.error || 'Invalid file structure',
          code: 'INVALID_FORMAT',
        },
      ],
      warnings: [],
    }
  }

  const validation = validateCatalogImport(data)
  return validation
}

export function checkFileExtension(file: File): {
  isValid: boolean
  error?: string
} {
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed extensions: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
    }
  }

  return { isValid: true }
}

export function checkFileSize(file: File, maxSize: number = MAX_FILE_SIZE): {
  isValid: boolean
  error?: string
} {
  if (file.size > maxSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    const maxSizeInMB = (maxSize / (1024 * 1024)).toFixed(2)
    return {
      isValid: false,
      error: `File too large (${sizeInMB}MB). Maximum size is ${maxSizeInMB}MB`,
    }
  }

  return { isValid: true }
}

export function checkMimeType(file: File): {
  isValid: boolean
  error?: string
} {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid MIME type: ${file.type || 'unknown'}`,
    }
  }

  return { isValid: true }
}

export function createImportError(error: unknown): ImportValidationError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'INVALID_FORMAT',
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'INVALID_FORMAT',
    }
  }

  return {
    message: 'Unknown error occurred',
    code: 'INVALID_FORMAT',
  }
}

export function getImportMetadata(file: File): ImportMetadata {
  return {
    fileName: file.name,
    fileSize: file.size,
    lastModified: file.lastModified,
    isValidJson: false,
    hasValidStructure: false,
  }
}

export async function processImportFile(file: File): Promise<ImportResult> {
  try {
    const extensionCheck = checkFileExtension(file)
    if (!extensionCheck.isValid) {
      return {
        success: false,
        error: extensionCheck.error,
      }
    }

    const sizeCheck = checkFileSize(file)
    if (!sizeCheck.isValid) {
      return {
        success: false,
        error: sizeCheck.error,
      }
    }

    const data = await parseJSONFile(file)

    const validation = validateImportFile(data)

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        error: 'File validation failed',
      }
    }

    return {
      success: true,
      data: validation.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process file',
    }
  }
}

export async function validateFile(file: File): Promise<{
  isValid: boolean
  error?: string
}> {
  const extensionCheck = checkFileExtension(file)
  if (!extensionCheck.isValid) {
    return extensionCheck
  }

  const sizeCheck = checkFileSize(file)
  if (!sizeCheck.isValid) {
    return sizeCheck
  }

  const mimeCheck = checkMimeType(file)
  if (!mimeCheck.isValid) {
    return mimeCheck
  }

  return { isValid: true }
}

export async function readAndValidateJSON(file: File): Promise<{
  isValid: boolean
  data?: unknown
  error?: string
}> {
  const fileContent = await file.text()
  
  const syntaxCheck = validateJSONSyntax(fileContent)
  if (!syntaxCheck.isValid) {
    return {
      isValid: false,
      error: syntaxCheck.error,
    }
  }

  try {
    const data = JSON.parse(fileContent)
    return {
      isValid: true,
      data,
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to parse JSON',
    }
  }
}
