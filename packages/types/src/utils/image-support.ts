import type { PreferredFormat, ImageFormatSupport } from './storage'

const SUPPORT_CHECK_KEY = 'image-format-support'

export async function detectImageCapabilities(): Promise<ImageFormatSupport> {
  const cached = getSupportedFormatsCache()
  if (cached) {
    return cached
  }

  const [webP, avif] = await Promise.all([
    supportsWebP(),
    supportsAVIF(),
  ])

  const jpeg = supportsJPEG()
  const support: ImageFormatSupport = {
    webP,
    avif,
    jpeg,
    preferred: getBestSupportedFormat(webP, avif, jpeg),
  }

  setSupportedFormatsCache(support)
  return support
}

export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const cached = getSessionValue(SUPPORT_CHECK_KEY, 'webp')
  if (cached !== null) return Boolean(cached)

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  const supported = canvas
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0

  setSessionValue(SUPPORT_CHECK_KEY, 'webp', supported)
  return supported
}

export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const cached = getSessionValue(SUPPORT_CHECK_KEY, 'avif')
  if (cached !== null) return Boolean(cached)

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  const canvasSupported = canvas
    .toDataURL('image/avif')
    .indexOf('data:image/avif') === 0

  if (canvasSupported) {
    setSessionValue(SUPPORT_CHECK_KEY, 'avif', true)
    return true
  }

  const imageSupported = await testAVIFImage()
  setSessionValue(SUPPORT_CHECK_KEY, 'avif', imageSupported)
  return imageSupported
}

export function supportsJPEG(): boolean {
  return true
}

export function getBestSupportedFormat(
  webP?: boolean,
  avif?: boolean,
  jpeg?: boolean
): PreferredFormat {
  if (avif !== false && webP !== false && jpeg !== false) {
    const cached = getSessionValue(SUPPORT_CHECK_KEY, 'best')
    if (cached && typeof cached === 'string') {
      return cached as PreferredFormat
    }
  }

  if (avif) {
    setSessionValue(SUPPORT_CHECK_KEY, 'best', 'image/avif')
    return 'image/avif'
  }
  if (webP) {
    setSessionValue(SUPPORT_CHECK_KEY, 'best', 'image/webp')
    return 'image/webp'
  }
  if (jpeg) {
    setSessionValue(SUPPORT_CHECK_KEY, 'best', 'image/jpeg')
    return 'image/jpeg'
  }

  return 'image/png'
}

export function getFormatPriority(format: PreferredFormat): number {
  const priorities: Record<PreferredFormat, number> = {
    'image/avif': 1,
    'image/webp': 2,
    'image/jpeg': 3,
    'image/png': 4,
  }
  return priorities[format] ?? 99
}

export function getFallbackFormats(format: PreferredFormat): PreferredFormat[] {
  const fallbacks: Record<PreferredFormat, PreferredFormat[]> = {
    'image/avif': ['image/webp', 'image/jpeg', 'image/png'],
    'image/webp': ['image/jpeg', 'image/png'],
    'image/jpeg': ['image/png'],
    'image/png': [],
  }
  return fallbacks[format] ?? []
}

function testAVIFImage(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const avif = new Image()
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='

    avif.onload = () => {
      resolve(avif.height === 1)
    }

    avif.onerror = () => {
      resolve(false)
    }
  })
}

function getSupportedFormatsCache(): ImageFormatSupport | null {
  try {
    const cached = sessionStorage.getItem(SUPPORT_CHECK_KEY)
    if (cached) {
      return JSON.parse(cached) as ImageFormatSupport
    }
  } catch {
    return null
  }
  return null
}

function setSupportedFormatsCache(support: ImageFormatSupport): void {
  try {
    sessionStorage.setItem(SUPPORT_CHECK_KEY, JSON.stringify(support))
  } catch {
    // Ignore errors
  }
}

function getSessionValue(key: string, prop: string): unknown | null {
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const data = JSON.parse(cached) as Record<string, unknown>
      return data[prop] ?? null
    }
  } catch {
    return null
  }
  return null
}

function setSessionValue(key: string, prop: string, value: unknown): void {
  try {
    let data = {}
    const cached = sessionStorage.getItem(key)
    if (cached) {
      data = JSON.parse(cached)
    }
    data = { ...data, [prop]: value }
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore errors
  }
}
