import { useOnboardingStore } from '@/stores/onboarding-store'

export type AnalyticsEventType =
  | 'step_view'
  | 'step_complete'
  | 'step_skip'
  | 'tour_start'
  | 'tour_complete'
  | 'tour_skip'

export interface AnalyticsEvent {
  type: AnalyticsEventType
  stepId?: string
  timestamp: number
  duration?: number
  metadata?: Record<string, unknown>
}

const ANALYTICS_KEY = 'tiny-till-onboarding-analytics'

export const trackEvent = (event: AnalyticsEvent) => {
  try {
    const existingData = localStorage.getItem(ANALYTICS_KEY)
    const events: AnalyticsEvent[] = existingData ? JSON.parse(existingData) : []
    
    events.push(event)
    
    const last100Events = events.slice(-100)
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(last100Events))
  } catch (error) {
    console.error('[OnboardingAnalytics] Failed to track event:', error)
  }
}

export const getAnalyticsEvents = (): AnalyticsEvent[] => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const clearAnalytics = () => {
  try {
    localStorage.removeItem(ANALYTICS_KEY)
  } catch (error) {
    console.error('[OnboardingAnalytics] Failed to clear analytics:', error)
  }
}

export const calculateCompletionMetrics = () => {
  const events = getAnalyticsEvents()
  const state = useOnboardingStore.getState()
  
  const tourStartEvent = events.find(e => e.type === 'tour_start')
  const tourEndEvent = events.find(e => 
    e.type === 'tour_complete' || e.type === 'tour_skip'
  )
  
  const totalDuration = tourStartEvent && tourEndEvent
    ? tourEndEvent.timestamp - tourStartEvent.timestamp
    : 0
  
  const stepsViewed = events
    .filter(e => e.type === 'step_view')
    .map(e => e.stepId)
    .filter((id): id is string => id !== undefined)
  
  const uniqueStepsViewed = Array.from(new Set(stepsViewed))
  
  const stepsCompleted = events
    .filter(e => e.type === 'step_complete')
    .map(e => e.stepId)
    .filter((id): id is string => id !== undefined)
  
  const stepsSkipped = events
    .filter(e => e.type === 'step_skip')
    .map(e => e.stepId)
    .filter((id): id is string => id !== undefined)
  
  return {
    totalDuration,
    tourStartedAt: tourStartEvent?.timestamp || null,
    tourEndedAt: tourEndEvent?.timestamp || null,
    totalStepsViewed: uniqueStepsViewed.length,
    totalStepsCompleted: stepsCompleted.length,
    totalStepsSkipped: stepsSkipped.length,
    completionRate: state.analytics.totalStepsCompleted > 0
      ? (state.analytics.totalStepsCompleted / 6) * 100
      : 0,
    wasCompleted: tourEndEvent?.type === 'tour_complete',
    wasSkipped: tourEndEvent?.type === 'tour_skip',
  }
}

export const generateAnalyticsReport = () => {
  const metrics = calculateCompletionMetrics()
  const state = useOnboardingStore.getState()
  
  return {
    status: state.isCompleted ? 'Completed' : state.isSkipped ? 'Skipped' : 'In Progress',
    version: state.version,
    metrics: {
      totalDuration: metrics.totalDuration,
      totalDurationFormatted: formatDuration(metrics.totalDuration),
      tourStartedAt: metrics.tourStartedAt ? new Date(metrics.tourStartedAt).toISOString() : null,
      tourEndedAt: metrics.tourEndedAt ? new Date(metrics.tourEndedAt).toISOString() : null,
      stepsViewed: metrics.totalStepsViewed,
      stepsCompleted: metrics.totalStepsCompleted,
      stepsSkipped: metrics.totalStepsSkipped,
      completionRate: `${metrics.completionRate.toFixed(1)}%`,
    },
    analytics: state.analytics,
    totalEvents: getAnalyticsEvents().length,
  }
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export const exportAnalytics = (): string => {
  const report = generateAnalyticsReport()
  return JSON.stringify(report, null, 2)
}

export const resetAnalytics = () => {
  clearAnalytics()
  useOnboardingStore.getState().resetOnboarding()
}
