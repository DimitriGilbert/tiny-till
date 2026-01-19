import * as React from 'react'
import { useOnboardingStore, type OnboardingStep } from '@/stores/onboarding-store'
import { ONBOARDING_STEPS, getTotalSteps } from '@/lib/onboarding-steps'
import { OnboardingTooltip } from '@/components/onboarding-tooltip'
import { OnboardingSpotlight } from '@/components/onboarding-spotlight'

interface OnboardingContextValue {
  isActive: boolean
  currentStep: OnboardingStep | null
  stepIndex: number
  totalSteps: number
  isCompleted: boolean
  isSkipped: boolean
  startOnboarding: () => void
  skipOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  resetOnboarding: () => void
  registerAction: (action: string) => void
}

const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(undefined)

export function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    isActive,
    currentStepIndex,
    isCompleted,
    isSkipped,
    startOnboarding: storeStartOnboarding,
    nextStep: storeNextStep,
    previousStep: storePreviousStep,
    skipOnboarding: storeSkipOnboarding,
    resetOnboarding: storeResetOnboarding,
    trackStepView,
    trackStepSkip,
    markStepCompleted,
    updateLastActivity,
  } = useOnboardingStore()

  const totalSteps = getTotalSteps()
  const currentStep = ONBOARDING_STEPS[currentStepIndex] || null

  React.useEffect(() => {
    if (isActive && currentStep) {
      trackStepView(currentStep.id)
    }
  }, [isActive, currentStep, trackStepView])

  React.useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive])

  const startOnboarding = React.useCallback(() => {
    storeStartOnboarding()
  }, [storeStartOnboarding])

  const skipOnboarding = React.useCallback(() => {
    if (currentStep) {
      trackStepSkip(currentStep.id)
    }
    storeSkipOnboarding()
  }, [storeSkipOnboarding, currentStep, trackStepSkip])

  const nextStep = React.useCallback(() => {
    if (currentStep) {
      markStepCompleted(currentStep.id)
    }
    storeNextStep()
  }, [storeNextStep, currentStep, markStepCompleted])

  const previousStep = React.useCallback(() => {
    storePreviousStep()
  }, [storePreviousStep])

  const resetOnboarding = React.useCallback(() => {
    storeResetOnboarding()
  }, [storeResetOnboarding])

  const registerAction = React.useCallback((action: string) => {
    updateLastActivity()
  }, [updateLastActivity])

  const contextValue: OnboardingContextValue = React.useMemo(
    () => ({
      isActive,
      currentStep,
      stepIndex: currentStepIndex,
      totalSteps,
      isCompleted,
      isSkipped,
      startOnboarding,
      skipOnboarding,
      nextStep,
      previousStep,
      resetOnboarding,
      registerAction,
    }),
    [
      isActive,
      currentStep,
      currentStepIndex,
      totalSteps,
      isCompleted,
      isSkipped,
      startOnboarding,
      skipOnboarding,
      nextStep,
      previousStep,
      resetOnboarding,
      registerAction,
    ]
  )

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      {isActive && currentStep && (
        <>
          <OnboardingSpotlight
            targetSelector={currentStep.targetSelector}
            isActive={isActive && currentStep.position !== 'center'}
          />
          <OnboardingTooltip
            step={currentStep}
            currentIndex={currentStepIndex}
            totalSteps={totalSteps}
            onNext={nextStep}
            onPrevious={previousStep}
            onSkip={skipOnboarding}
            onClose={skipOnboarding}
            isOpen={isActive}
          />
        </>
      )}
    </OnboardingContext.Provider>
  )
}
