# Task 7.6: User Onboarding Experience Implementation Plan

## Overview
Develop a comprehensive first-time user onboarding experience for tiny-till with interactive tooltips, guided tour, feature highlights, and analytics tracking.

## Implementation Plan

### Phase 1: Core Infrastructure (Step 1-3)

#### Step 1: Add Onboarding Storage Keys
**File:** `apps/web/src/lib/storage-keys.ts`

**Changes:**
- Add new storage keys for onboarding state:
  - `ONBOARDING_COMPLETED`: 'tiny-till-onboarding-completed'
  - `ONBOARDING_CURRENT_STEP`: 'tiny-till-onboarding-current-step'
  - `ONBOARDING_SKIPPED`: 'tiny-till-onboarding-skipped'
  - `ONBOARDING_ANALYTICS`: 'tiny-till-onboarding-analytics'
  - `ONBOARDING_VERSION`: 'tiny-till-onboarding-version'

#### Step 2: Create Onboarding Store with Zustand
**File:** `apps/web/src/stores/onboarding-store.ts` (new file)

**Structure:**
```typescript
// Types
interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string
  image?: string
}

interface OnboardingAnalytics {
  startedAt: number | null
  completedAt: number | null
  stepsViewed: string[]
  stepsSkipped: string[]
  totalTimeSpent: number
  totalStepsCompleted: number
  lastActivity: number
}

interface OnboardingState {
  isActive: boolean
  currentStepIndex: number
  isCompleted: boolean
  isSkipped: boolean
  analytics: OnboardingAnalytics
  version: string
}

interface OnboardingActions {
  startOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  goToStep: (index: number) => void
  trackStepView: (stepId: string) => void
  trackStepSkip: (stepId: string) => void
  markStepCompleted: (stepId: string) => void
  updateLastActivity: () => void
}
```

**Key Features:**
- Zustand with devtools middleware
- Local storage persistence for state and analytics
- Analytics tracking for each step
- Version tracking to detect schema changes
- Action dispatch for step transitions

#### Step 3: Define Onboarding Steps and Tour Content
**File:** `apps/web/src/lib/onboarding-steps.ts` (new file)

**Steps Definition:**
1. **Welcome** (center overlay)
   - Title: "Welcome to tiny-till!"
   - Description: "A lightweight, offline-first point of sale for quick tallying"
   - Action: "Get Started"

2. **Tally Page Overview** (header area)
   - Title: "Your Product Catalog"
   - Description: "Browse and select products to add to your tally"
   - Target: Header title area

3. **Product Cards** (product grid)
   - Title: "Quick Add Products"
   - Description: "Tap + to add, or long-press for quantity options"
   - Target: First product card

4. **Tally Footer** (sticky footer)
   - Title: "Track Your Totals"
   - Description: "See item count and total at the bottom"
   - Target: Sticky tally footer

5. **Settings** (header navigation)
   - Title: "Manage Your Catalog"
   - Description: "Add products, import/export data, and configure settings"
   - Target: Settings link

6. **Completion** (center overlay)
   - Title: "You're All Set!"
   - Description: "Start tallying or replay this tour anytime from settings"
   - Action: "Start Tallying"

### Phase 2: UI Components (Step 4-6)

#### Step 4: Create Tooltip/Popover Component for Onboarding
**File:** `apps/web/src/components/onboarding-tooltip.tsx` (new file)

**Features:**
- Use Base UI Positioner and Portal for positioning
- Support for arrow/directional indicators
- Step progress indicator (e.g., "Step 2 of 5")
- Previous/Next navigation buttons
- Skip button available on all steps
- Close button (X) to dismiss
- Responsive positioning logic
- z-index layering above other UI elements
- Animation presets from `@/lib/animations`

**Props:**
```typescript
interface OnboardingTooltipProps {
  step: OnboardingStep
  currentIndex: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onClose: () => void
  isOpen: boolean
}
```

#### Step 5: Create Spotlight/Highlight Component
**File:** `apps/web/src/components/onboarding-spotlight.tsx` (new file)

**Features:**
- Dimmed overlay with cutout for highlighted element
- Smooth transitions between targets
- Support for element boundary calculation
- Padding around highlighted element
- Animation for spotlight movement

**Props:**
```typescript
interface OnboardingSpotlightProps {
  targetSelector?: string
  isActive: boolean
}
```

#### Step 6: Create Onboarding Context Provider
**File:** `apps/web/src/components/onboarding-provider.tsx` (new file)

**Features:**
- Context provider wrapping app root
- Exposes onboarding state and actions to components
- Listens for route changes to advance context-aware steps
- Handles auto-advance on user actions
- Manages spotlight and tooltip rendering

**Context API:**
```typescript
interface OnboardingContextValue {
  isActive: boolean
  currentStep: OnboardingStep | null
  stepIndex: number
  totalSteps: number
  startOnboarding: () => void
  skipOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  resetOnboarding: () => void
  registerAction: (action: string) => void
}
```

### Phase 3: Integration (Step 7-9)

#### Step 7: Integrate Onboarding into Root Layout
**File:** `apps/web/src/routes/__root.tsx`

**Changes:**
- Wrap `<ThemeProvider>` with `<OnboardingProvider>`
- Add `OnboardingSpotlight` component (conditionally rendered)
- Add `OnboardingTooltip` component (conditionally rendered)
- Check for first-time visit on mount

#### Step 8: Add Onboarding Trigger to Main Page
**File:** `apps/web/src/routes/index.tsx`

**Changes:**
- Add "Take a tour" button in empty state when no products
- Add onboarding indicator in header when not completed
- Trigger onboarding automatically for first-time users

#### Step 9: Add Replay Option in Settings
**File:** `apps/web/src/routes/settings.tsx`

**Changes:**
- Add "Reset Onboarding" section
- Button to replay onboarding tour
- Display onboarding status (completed/skipped)
- Display basic analytics (optional)

### Phase 4: Context-Aware Hints (Step 10-11)

#### Step 10: Create Context Hint System
**File:** `apps/web/src/lib/onboarding-hints.ts` (new file)

**Features:**
- Define hint rules based on user actions
- Hint timeout/delay settings
- Hint dismissal logic

**Hint Rules:**
- Empty catalog hint: "Add your first product in Settings"
- First tally action hint: "Great! Keep adding products"
- Long idle hint: "Need help? Check the onboarding tour"
- Keyboard shortcut hint: "Tip: Use arrow keys for quick navigation"

#### Step 11: Create Hint Toast Component
**File:** `apps/web/src/components/onboarding-hint-toast.tsx` (new file)

**Features:**
- Use sonner for toast display
- Icon + text format
- Dismissible with "Don't show again" option
- Auto-dismiss after timeout
- Store dismissed hints in localStorage

### Phase 5: Analytics and Metrics (Step 12)

#### Step 12: Implement Analytics Tracking
**File:** `apps/web/src/lib/onboarding-analytics.ts` (new file)

**Functions:**
```typescript
interface AnalyticsEvent {
  type: 'step_view' | 'step_complete' | 'step_skip' | 'tour_start' | 'tour_complete' | 'tour_skip'
  stepId?: string
  timestamp: number
  duration?: number
}

// Track events and store in localStorage
// Calculate completion metrics
// Generate analytics report
```

**Metrics Tracked:**
- Tour start time
- Tour completion time (or skip time)
- Time spent on each step
- Steps viewed vs completed
- Actions taken during tour
- Device/browser info
- Replay attempts

### Phase 6: Testing and Polish (Step 13-14)

#### Step 13: Accessibility and Responsive Design
- Add keyboard navigation support (Esc to dismiss, arrows for steps)
- Ensure screen reader announcements for tour progress
- Test spotlight positioning on various screen sizes
- Test on mobile devices (touch targets)
- Add ARIA attributes for tooltips
- Focus management (focus trap in tooltip)

#### Step 14: Final Testing and Verification
- Test first-time user flow end-to-end
- Test skip and replay functionality
- Verify localStorage persistence
- Test context-aware hints
- Run `npm run check-types`
- Run `npm run build`
- Verify no LSP errors

## File Summary

### New Files to Create:
1. `apps/web/src/stores/onboarding-store.ts` - Zustand store for onboarding state
2. `apps/web/src/lib/onboarding-steps.ts` - Tour step definitions
3. `apps/web/src/components/onboarding-tooltip.tsx` - Tooltip component
4. `apps/web/src/components/onboarding-spotlight.tsx` - Highlight overlay
5. `apps/web/src/components/onboarding-provider.tsx` - Context provider
6. `apps/web/src/components/onboarding-hint-toast.tsx` - Hint toast component
7. `apps/web/src/lib/onboarding-hints.ts` - Hint rule definitions
8. `apps/web/src/lib/onboarding-analytics.ts` - Analytics tracking utilities

### Files to Modify:
1. `apps/web/src/lib/storage-keys.ts` - Add onboarding storage keys
2. `apps/web/src/routes/__root.tsx` - Integrate onboarding provider and components
3. `apps/web/src/routes/index.tsx` - Add tour triggers and hints
4. `apps/web/src/routes/settings.tsx` - Add replay option

## Technical Considerations

### State Management
- Use Zustand with persist middleware (similar to existing stores)
- Store version to handle future schema changes
- Graceful fallback if storage fails

### UX Design
- Non-intrusive design - easy to skip
- Progress indicator to show tour length
- Optional tour (not mandatory)
- Keyboard shortcuts for power users
- Context-aware hints that respect user learning

### Performance
- Lazy load onboarding components
- Use requestAnimationFrame for smooth spotlight animation
- Debounce scroll events for spotlight positioning
- Minimal bundle impact (code-split if needed)

### Accessibility
- Keyboard navigation (Esc, arrows, Tab)
- ARIA live regions for announcements
- High contrast text in tooltips
- Focus management
- Screen reader support

### Responsive Design
- Responsive positioning for tooltips
- Touch-friendly on mobile
- Adjust step order for different screen sizes
- Portrait vs landscape considerations

## Dependencies
No new dependencies required - uses existing:
- React 19
- Zustand (already installed)
- Base UI primitives (already installed)
- Tailwind CSS (already installed)
- sonner (already installed for toasts)

## Success Criteria
- First-time users see onboarding on initial visit
- Users can skip tour at any point
- Tour can be replayed from settings
- Onboarding status persists in localStorage
- Analytics track completion and engagement metrics
- Context-aware hints appear at appropriate moments
- No TypeScript errors
- Build succeeds
- Tour integrates seamlessly with existing UX
