import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '../dist')
const PUBLIC_DIR = path.resolve(__dirname, '../public')

interface ValidationRule {
  name: string
  check: () => { passed: boolean; message: string }
}

interface BuildValidationResult {
  passed: boolean
  results: Array<{
    name: string
    passed: boolean
    message: string
  }>
  summary: {
    total: number
    passed: number
    failed: number
  }
}

const RULES: ValidationRule[] = [
  {
    name: 'Dist directory exists',
    check: () => {
      const exists = fs.existsSync(DIST_DIR)
      return {
        passed: exists,
        message: exists ? 'Build output directory exists' : 'Build output directory not found'
      }
    }
  },
  {
    name: 'HTML file generated',
    check: () => {
      const htmlPath = path.join(DIST_DIR, 'index.html')
      const exists = fs.existsSync(htmlPath)
      return {
        passed: exists,
        message: exists ? 'index.html found' : 'index.html not found'
      }
    }
  },
  {
    name: 'JavaScript bundles generated',
    check: () => {
      const jsFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.js'))
      const passed = jsFiles.length >= 2
      return {
        passed,
        message: passed ? `Found ${jsFiles.length} JS bundles` : `Expected at least 2 JS bundles, found ${jsFiles.length}`
      }
    }
  },
  {
    name: 'CSS files generated',
    check: () => {
      const assetsDir = path.join(DIST_DIR, 'assets')
      if (!fs.existsSync(assetsDir)) {
        return { passed: false, message: 'assets directory not found' }
      }
      const cssFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.css'))
      const passed = cssFiles.length >= 1
      return {
        passed,
        message: passed ? `Found ${cssFiles.length} CSS files` : `Expected at least 1 CSS file, found ${cssFiles.length}`
      }
    }
  },
  {
    name: 'Service worker generated',
    check: () => {
      const swPath = path.join(DIST_DIR, 'sw.js')
      const exists = fs.existsSync(swPath)
      return {
        passed: exists,
        message: exists ? 'Service worker (sw.js) found' : 'Service worker (sw.js) not found'
      }
    }
  },
  {
    name: 'Gzip compression files',
    check: () => {
      const assetsDir = path.join(DIST_DIR, 'assets')
      if (!fs.existsSync(assetsDir)) {
        return { passed: false, message: 'assets directory not found' }
      }
      const gzFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.gz'))
      const distGzFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.gz'))
      const totalGzFiles = gzFiles.length + distGzFiles.length
      const passed = totalGzFiles >= 2
      return {
        passed,
        message: passed ? `Found ${totalGzFiles} gzip compressed files` : `Expected at least 2 gzip files, found ${totalGzFiles}`
      }
    }
  },
  {
    name: 'Brotli compression files',
    check: () => {
      const assetsDir = path.join(DIST_DIR, 'assets')
      if (!fs.existsSync(assetsDir)) {
        return { passed: false, message: 'assets directory not found' }
      }
      const brFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.br'))
      const distBrFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.br'))
      const totalBrFiles = brFiles.length + distBrFiles.length
      const passed = totalBrFiles >= 2
      return {
        passed,
        message: passed ? `Found ${totalBrFiles} Brotli compressed files` : `Expected at least 2 Brotli files, found ${totalBrFiles}`
      }
    }
  },
  {
    name: 'Source maps excluded',
    check: () => {
      const mapFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.map'))
      const passed = mapFiles.length === 0
      return {
        passed,
        message: passed ? 'No source maps found (correct for production)' : `Found ${mapFiles.length} source maps (should be excluded)`
      }
    }
  },
  {
    name: 'CSP meta tag in HTML',
    check: () => {
      const htmlPath = path.join(DIST_DIR, 'index.html')
      if (!fs.existsSync(htmlPath)) {
        return { passed: false, message: 'index.html not found' }
      }
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8')
      const hasCSP = htmlContent.includes('Content-Security-Policy')
      return {
        passed: hasCSP,
        message: hasCSP ? 'CSP meta tag found' : 'CSP meta tag not found'
      }
    }
  },
  {
    name: '_headers file exists',
    check: () => {
      const headersPath = path.join(PUBLIC_DIR, '_headers')
      const exists = fs.existsSync(headersPath)
      return {
        passed: exists,
        message: exists ? '_headers file found' : '_headers file not found'
      }
    }
  },
  {
    name: 'offline.html exists in dist',
    check: () => {
      const offlinePath = path.join(DIST_DIR, 'offline.html')
      const exists = fs.existsSync(offlinePath)
      return {
        passed: exists,
        message: exists ? 'offline.html found' : 'offline.html not found'
      }
    }
  },
  {
    name: 'Total bundle size',
    check: () => {
      const jsFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.js'))
      let totalSize = 0
      jsFiles.forEach((file) => {
        const filePath = path.join(DIST_DIR, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      })
      const maxSize = 500 * 1024
      const passed = totalSize <= maxSize
      return {
        passed,
        message: passed ? 
          `Total JS size: ${(totalSize / 1024).toFixed(2)}KB (within ${maxSize / 1024}KB limit)` : 
          `Total JS size: ${(totalSize / 1024).toFixed(2)}KB (exceeds ${maxSize / 1024}KB limit)`
      }
    }
  },
  {
    name: 'No chunk exceeds size limit',
    check: () => {
      const jsFiles = fs.readdirSync(DIST_DIR).filter((file) => file.endsWith('.js'))
      const maxSize = 150 * 1024
      const largeChunks: string[] = []
      
      jsFiles.forEach((file) => {
        const filePath = path.join(DIST_DIR, file)
        const stats = fs.statSync(filePath)
        if (stats.size > maxSize) {
          largeChunks.push(`${file}: ${(stats.size / 1024).toFixed(2)}KB`)
        }
      })
      
      const passed = largeChunks.length === 0
      return {
        passed,
        message: passed ? 
          'All chunks within size limit' : 
          `Found ${largeChunks.length} chunks exceeding ${maxSize / 1024}KB limit: ${largeChunks.join(', ')}`
      }
    }
  },
  {
    name: 'Icons directory in dist',
    check: () => {
      const iconsDir = path.join(DIST_DIR, 'icons')
      const exists = fs.existsSync(iconsDir)
      return {
        passed: exists,
        message: exists ? 'icons directory found' : 'icons directory not found'
      }
    }
  },
  {
    name: 'Favicon present',
    check: () => {
      const iconsDir = path.join(DIST_DIR, 'icons')
      const faviconPath = path.join(DIST_DIR, 'favicon.ico')
      const hasFavicon = fs.existsSync(faviconPath)
      const hasIcons = fs.existsSync(iconsDir)
      const passed = hasFavicon || hasIcons
      return {
        passed,
        message: hasFavicon ? 'favicon.ico found' : hasIcons ? 'icons directory present' : 'favicon.ico not found and no icons directory'
      }
    }
  }
]

function validateBuild(): BuildValidationResult {
  console.log('🔍 Starting build validation...\n')

  const results: Array<{
    name: string
    passed: boolean
    message: string
  }> = []

  for (const rule of RULES) {
    try {
      const result = rule.check()
      results.push({
        name: rule.name,
        passed: result.passed,
        message: result.message
      })
      
      const icon = result.passed ? '✅' : '❌'
      console.log(`${icon} ${rule.name}`)
      console.log(`   ${result.message}\n`)
    } catch (error) {
      results.push({
        name: rule.name,
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`❌ ${rule.name}`)
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    }
  }

  const passed = results.every((result) => result.passed)
  const summary = {
    total: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length
  }

  console.log('\n📊 Validation Summary:')
  console.log(`   Total: ${summary.total}`)
  console.log(`   Passed: ${summary.passed}`)
  console.log(`   Failed: ${summary.failed}`)
  console.log(`\n${passed ? '✨ Build validation PASSED' : '⚠️  Build validation FAILED'}`)

  return {
    passed,
    results,
    summary
  }
}

function main(): void {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }

  const result = validateBuild()
  
  if (!result.passed) {
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { validateBuild, RULES }
export type { BuildValidationResult, ValidationRule }
