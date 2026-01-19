import type { OnboardingHint } from '@/components/onboarding-hint-toast'

export interface HintRule {
  id: string
  condition: () => boolean
  delay: number
  hint: OnboardingHint
  priority: number
  dismissible: boolean
}

export const HINT_RULES: HintRule[] = [
  {
    id: 'empty-catalog',
    condition: () => {
      const catalog = localStorage.getItem('tiny-till-catalog')
      if (!catalog) return false
      try {
        const products = JSON.parse(catalog)
        return !products || products.length === 0
      } catch {
        return false
      }
    },
    delay: 5000,
    priority: 1,
    dismissible: true,
    hint: {
      id: 'empty-catalog',
      icon: '📦',
      title: 'Add your first product',
      description: 'Go to Settings to add products to your catalog and start tallying',
    },
  },
  {
    id: 'first-tally',
    condition: () => {
      const hasSeenHint = localStorage.getItem('tiny-till-hint-first-tally')
      if (hasSeenHint) return false
      
      const tally = localStorage.getItem('tiny-till-tally')
      if (!tally) return false
      try {
        const items = JSON.parse(tally)
        return items && Object.keys(items).length > 0
      } catch {
        return false
      }
    },
    delay: 2000,
    priority: 2,
    dismissible: true,
    hint: {
      id: 'first-tally',
      icon: '✨',
      title: 'Great start!',
      description: 'Keep adding products to your tally. Tap the quantity badge to edit amounts',
    },
  },
  {
    id: 'long-idle',
    condition: () => {
      const lastActivity = localStorage.getItem('tiny-till-last-activity')
      if (!lastActivity) return false
      
      const now = Date.now()
      const idleTime = now - parseInt(lastActivity, 10)
      const hasSeenHint = localStorage.getItem('tiny-till-hint-long-idle')
      
      return idleTime > 5 * 60 * 1000 && !hasSeenHint
    },
    delay: 0,
    priority: 3,
    dismissible: true,
    hint: {
      id: 'long-idle',
      icon: '💡',
      title: 'Need help?',
      description: 'Replay the onboarding tour anytime from Settings if you need a refresher',
    },
  },
  {
    id: 'keyboard-shortcuts',
    condition: () => {
      const hasSeenHint = localStorage.getItem('tiny-till-hint-keyboard-shortcuts')
      return !hasSeenHint
    },
    delay: 30000,
    priority: 4,
    dismissible: true,
    hint: {
      id: 'keyboard-shortcuts',
      icon: '⌨️',
      title: 'Tip: Quick navigation',
      description: 'Use arrow keys to navigate and Enter to add products',
    },
  },
]

export const shouldShowHint = (rule: HintRule): boolean => {
  return rule.condition()
}

export const markHintAsDismissed = (hintId: string) => {
  localStorage.setItem(`tiny-till-hint-${hintId}`, 'true')
}

export const isHintDismissed = (hintId: string): boolean => {
  return localStorage.getItem(`tiny-till-hint-${hintId}`) === 'true'
}

export const updateLastActivity = () => {
  localStorage.setItem('tiny-till-last-activity', Date.now().toString())
}
