interface WebVitals {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  tbt: number
}

interface PerformanceMetrics {
  webVitals: WebVitals
  resourceTiming: PerformanceResourceTiming[]
  navigationTiming: PerformanceNavigationTiming
  memory: number | null
}

interface MetricEntry {
  name: string
  value: number
  timestamp: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

class PerformanceMonitor {
  private metrics: Map<string, MetricEntry> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window === 'undefined') return
    this.init()
  }

  private init(): void {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not supported')
      return
    }

    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeFCP()
    this.observeTTFB()
    this.observeTBT()
    this.observeResources()
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcpEntry = entries[entries.length - 1] as any
        this.recordMetric('LCP', lcpEntry.startTime, this.getLCPRating(lcpEntry.startTime))
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('LCP observation not supported', e)
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, this.getFIDRating(entry.processingStart - entry.startTime))
        })
      })
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('FID observation not supported', e)
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.recordMetric('CLS', clsValue, this.getCLSRating(clsValue))
      })
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('CLS observation not supported', e)
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime, this.getFCPRating(entry.startTime))
          }
        })
      })
      observer.observe({ type: 'paint', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('FCP observation not supported', e)
    }
  }

  private observeTTFB(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          this.recordMetric('TTFB', entry.responseStart - entry.requestStart, this.getTTFBRating(entry.responseStart - entry.requestStart))
        })
      })
      observer.observe({ type: 'navigation', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('TTFB observation not supported', e)
    }
  }

  private observeTBT(): void {
    if (!(window as any).PerformanceLongTaskTiming) {
      console.warn('Long Task Timing not supported')
      return
    }

    try {
      let tbt = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            tbt += entry.duration - 50
          }
        })
        this.recordMetric('TBT', tbt, this.getTBTRating(tbt))
      })
      observer.observe({ type: 'longtask', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('TBT observation not supported', e)
    }
  }

  private observeResources(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[]
        entries.forEach((entry) => {
          const duration = entry.responseEnd - entry.startTime
          if (duration > 1000) {
            console.warn(`Slow resource: ${entry.name} took ${duration.toFixed(0)}ms`)
          }
        })
      })
      observer.observe({ type: 'resource', buffered: true })
      this.observers.push(observer)
    } catch (e) {
      console.warn('Resource observation not supported', e)
    }
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor'): void {
    this.metrics.set(name, {
      name,
      value,
      timestamp: performance.now(),
      rating
    })
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 2.5 ? 'good' : value <= 4.0 ? 'needs-improvement' : 'poor'
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 1.8 ? 'good' : value <= 3.0 ? 'needs-improvement' : 'poor'
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 600 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
  }

  private getTBTRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 200 ? 'good' : value <= 600 ? 'needs-improvement' : 'poor'
  }

  getMetrics(): Map<string, MetricEntry> {
    return new Map(this.metrics)
  }

  getAllMetrics(): PerformanceMetrics {
    const webVitals: WebVitals = {
      lcp: this.metrics.get('LCP')?.value || 0,
      fid: this.metrics.get('FID')?.value || 0,
      cls: this.metrics.get('CLS')?.value || 0,
      fcp: this.metrics.get('FCP')?.value || 0,
      ttfb: this.metrics.get('TTFB')?.value || 0,
      tbt: this.metrics.get('TBT')?.value || 0
    }

    const resourceTiming = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    const memory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : null

    return {
      webVitals,
      resourceTiming,
      navigationTiming,
      memory
    }
  }

  getMetricSummary(): string {
    const metrics = this.getAllMetrics()
    const vitals = metrics.webVitals

    const loadTime = metrics.navigationTiming.loadEventEnd ? 
      (metrics.navigationTiming.loadEventEnd - metrics.navigationTiming.domContentLoadedEventEnd).toFixed(0) : 
      'N/A'

    return `
Performance Metrics Summary:
==========================
Largest Contentful Paint (LCP): ${vitals.lcp.toFixed(0)}ms [${this.metrics.get('LCP')?.rating || 'N/A'}]
First Input Delay (FID): ${vitals.fid.toFixed(0)}ms [${this.metrics.get('FID')?.rating || 'N/A'}]
Cumulative Layout Shift (CLS): ${vitals.cls.toFixed(3)} [${this.metrics.get('CLS')?.rating || 'N/A'}]
First Contentful Paint (FCP): ${vitals.fcp.toFixed(0)}ms [${this.metrics.get('FCP')?.rating || 'N/A'}]
Time to First Byte (TTFB): ${vitals.ttfb.toFixed(0)}ms [${this.metrics.get('TTFB')?.rating || 'N/A'}]
Total Blocking Time (TBT): ${vitals.tbt.toFixed(0)}ms [${this.metrics.get('TBT')?.rating || 'N/A'}]

Resources Loaded: ${metrics.resourceTiming.length}
Navigation Timing: ${loadTime}ms
${metrics.memory ? `Memory Usage: ${(metrics.memory / 1024 / 1024).toFixed(2)}MB` : ''}
    `.trim()
  }

  logMetrics(): void {
    if (typeof window === 'undefined') return
    console.log(this.getMetricSummary())
  }

  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

const performanceMonitor = new PerformanceMonitor()

export { performanceMonitor, PerformanceMonitor }
export type { WebVitals, PerformanceMetrics, MetricEntry }
