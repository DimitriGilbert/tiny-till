export interface EnvironmentData {
  appVersion: string
  buildNumber: string
  browser: {
    name: string
    version: string
    userAgent: string
  }
  device: {
    type: 'mobile' | 'tablet' | 'desktop'
    os: string
    osVersion: string
    screenWidth: number
    screenHeight: number
    pixelRatio: number
  }
  storage: {
    catalogSize: number
    availableQuota: number
    usedQuota: number
    storageType: string
  }
  network: {
    isOnline: boolean
    connectionType: string | undefined
    effectiveType: string | undefined
  }
  theme: {
    currentTheme: string
    systemTheme: string
  }
  settings: {
    gridDensity: string
    columnCount: number | undefined
    currency: string
    locale: string
  }
  errors: {
    recentErrors: number
    lastError: ErrorInfo | null
  }
  timestamp: number
}

export interface ErrorInfo {
  message: string
  stack: string | undefined
  timestamp: number
}

export async function captureEnvironmentData(): Promise<EnvironmentData> {
  const browser = detectBrowser()
  const device = detectDevice()
  const storage = await detectStorage()
  const network = detectNetwork()
  const theme = detectTheme()
  const settings = detectSettings()

  return {
    appVersion: '1.0.0',
    buildNumber: '1',
    browser,
    device,
    storage,
    network,
    theme,
    settings,
    errors: {
      recentErrors: 0,
      lastError: null,
    },
    timestamp: Date.now(),
  }
}

function detectBrowser() {
  const userAgent = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome'
    version = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Edg')) {
    name = 'Edge'
    version = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'Unknown'
  }

  return { name, version, userAgent }
}

function detectDevice() {
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const pixelRatio = window.devicePixelRatio
  const userAgent = navigator.userAgent

  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  let os = 'Unknown'
  let osVersion = 'Unknown'

  if (/Android/i.test(userAgent)) {
    os = 'Android'
    osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown'
    type = screenWidth < 768 ? 'mobile' : 'tablet'
  } else if (/iPhone/i.test(userAgent)) {
    os = 'iOS'
    osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown'
    type = 'mobile'
  } else if (/iPad/i.test(userAgent)) {
    os = 'iPadOS'
    osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown'
    type = 'tablet'
  } else if (/Mac/i.test(userAgent)) {
    os = 'macOS'
    type = 'desktop'
  } else if (/Windows/i.test(userAgent)) {
    os = 'Windows'
    type = 'desktop'
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux'
    type = 'desktop'
  }

  return { type, os, osVersion, screenWidth, screenHeight, pixelRatio }
}

async function detectStorage() {
  let catalogSize = 0
  let availableQuota = 0
  let usedQuota = 0
  let storageType = 'unknown'

  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      availableQuota = estimate.quota || 0
      usedQuota = estimate.usage || 0
      storageType = 'estimated'
    }

    const catalogData = localStorage.getItem('tiny-till-catalog')
    if (catalogData) {
      catalogSize = new Blob([catalogData]).size
    }

    if (indexedDB) {
      storageType = 'IndexedDB'
    } else if (localStorage) {
      storageType = 'localStorage'
    }
  } catch (error) {
    console.error('Error detecting storage:', error)
  }

  return { catalogSize, availableQuota, usedQuota, storageType }
}

function detectNetwork() {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    isOnline: navigator.onLine,
    connectionType: connection?.effectiveType,
    effectiveType: connection?.type,
  }
}

function detectTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const currentTheme = localStorage.getItem('tiny-till-theme') || 'system'

  return {
    currentTheme,
    systemTheme,
  }
}

function detectSettings() {
  const gridDensity = localStorage.getItem('tiny-till-grid-density') || 'normal'
  const columnCountStr = localStorage.getItem('tiny-till-column-count')
  const columnCount = columnCountStr ? Number.parseInt(columnCountStr, 10) : undefined

  return {
    gridDensity,
    columnCount,
    currency: 'USD',
    locale: navigator.language,
  }
}

export function formatEnvironmentData(env: EnvironmentData): string {
  return `
Tiny-Till Environment Report
==========================
Generated: ${new Date(env.timestamp).toISOString()}

App Information
----------------
Version: ${env.appVersion}
Build: ${env.buildNumber}

Browser
-------
Name: ${env.browser.name} ${env.browser.version}
User Agent: ${env.browser.userAgent}

Device
------
Type: ${env.device.type}
OS: ${env.device.os} ${env.device.osVersion}
Screen: ${env.device.screenWidth}x${env.device.screenHeight}
Pixel Ratio: ${env.device.pixelRatio}

Storage
--------
Catalog Size: ${(env.storage.catalogSize / 1024).toFixed(2)} KB
Used Quota: ${(env.storage.usedQuota / 1024 / 1024).toFixed(2)} MB
Available Quota: ${(env.storage.availableQuota / 1024 / 1024).toFixed(2)} MB
Storage Type: ${env.storage.storageType}

Network
-------
Online: ${env.network.isOnline}
Connection Type: ${env.network.connectionType || 'Unknown'}
Effective Type: ${env.network.effectiveType || 'Unknown'}

Theme
-----
Current: ${env.theme.currentTheme}
System: ${env.theme.systemTheme}

Settings
--------
Grid Density: ${env.settings.gridDensity}
Column Count: ${env.settings.columnCount || 'Auto'}
Currency: ${env.settings.currency}
Locale: ${env.settings.locale}
  `.trim()
}

export function captureErrorInfo(error: Error, componentStack?: string): ErrorInfo {
  return {
    message: error.message,
    stack: error.stack || componentStack,
    timestamp: Date.now(),
  }
}
