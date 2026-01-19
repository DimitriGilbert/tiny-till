import type { OnboardingStep } from '@/stores/onboarding-store'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to tiny-till!',
    description: 'A lightweight, offline-first point of sale for quick tallying',
    position: 'center',
    action: 'Get Started',
  },
  {
    id: 'tally-overview',
    title: 'Your Product Catalog',
    description: 'Browse and select products to add to your tally',
    targetSelector: '[data-onboarding="tally-page"]',
    position: 'bottom',
  },
  {
    id: 'product-cards',
    title: 'Quick Add Products',
    description: 'Tap + to add, or tap the quantity badge to edit amounts',
    targetSelector: '[data-onboarding="product-card"]:first-child',
    position: 'right',
  },
  {
    id: 'tally-footer',
    title: 'Track Your Totals',
    description: 'See item count and total at the bottom',
    targetSelector: '[data-onboarding="tally-footer"]',
    position: 'top',
  },
  {
    id: 'settings',
    title: 'Manage Your Catalog',
    description: 'Add products, import/export data, and configure settings',
    targetSelector: '[data-onboarding="settings-link"]',
    position: 'bottom',
  },
  {
    id: 'completion',
    title: "You're All Set!",
    description: 'Start tallying or replay this tour anytime from settings',
    position: 'center',
    action: 'Start Tallying',
  },
]

export const getStepById = (id: string): OnboardingStep | undefined => {
  return ONBOARDING_STEPS.find((step) => step.id === id)
}

export const getStepByIndex = (index: number): OnboardingStep | undefined => {
  return ONBOARDING_STEPS[index]
}

export const getStepIndex = (id: string): number => {
  return ONBOARDING_STEPS.findIndex((step) => step.id === id)
}

export const getTotalSteps = (): number => {
  return ONBOARDING_STEPS.length
}
