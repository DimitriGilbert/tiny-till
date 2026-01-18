# Task 4.7: Visual Feedback Animations System - Implementation Plan

## Overview

Implement a comprehensive animation system for all user interactions in the Tiny Till application. Focus on performance, subtlety, and enhancing UX without being distracting.

## Current State Assessment

### Existing Animations
- `apps/web/src/lib/animations.ts` - Basic animation utilities (pulse, shake, fade, slide)
- `apps/web/src/index.css` - Keyframe definitions for basic animations
- Partial implementation in:
  - `tally-product-card.tsx` - Quantity pulse and shake animations
  - `product-card.tsx` - Basic hover/active states
  - `validated-quantity-input.tsx` - Validation state transitions
  - `validation-error-message.tsx` - Fade-in animations

### Gaps Identified
1. Missing spring-like physics animations
2. Modal transitions are basic (zoom/fade only)
3. No loading indicators for async operations
4. Inconsistent animation timing across components
5. Missing highlight effects for active cards
6. No ripple/scale effects for touch feedback
7. Limited keyboard navigation animations
8. No skeleton loading states

## Implementation Plan

### Phase 1: Animation Infrastructure Enhancement

#### 1.1 Expand Animation Utilities (`apps/web/src/lib/animations.ts`)
**Objective**: Create a comprehensive animation utility library with spring physics and performance optimizations.

**Changes**:
- Add spring animation configurations (mass, stiffness, damping)
- Add spring keyframe animations
- Create helper functions for spring-based transforms
- Add animation composition utilities
- Add performance-focused animation variants (GPU-accelerated)
- Create animation timing presets (fast, normal, slow)
- Add animation state management utilities

**New Functions**:
```typescript
export const springConfig = {
  gentle: { mass: 0.8, stiffness: 150, damping: 15 },
  bouncy: { mass: 1, stiffness: 180, damping: 10 },
  snappy: { mass: 0.6, stiffness: 200, damping: 20 },
} as const

export const animationPresets = {
  touchFeedback: 'transition-transform duration-150 ease-out active:scale-95 hover:scale-105',
  cardActive: 'transition-all duration-300 ease-out',
  modalEnter: 'transition-all duration-250 ease-out',
  buttonPress: 'active:scale-95 transition-transform duration-100',
} as const

export function getSpringClasses(intensity: 'gentle' | 'bouncy' | 'snappy'): string
export function useSpringAnimation(trigger: boolean, config?: SpringConfig): CSSProperties
export function composeAnimations(...classes: string[]): string
export function getGPUIgnoredProperties(): string[]
```

#### 1.2 Enhanced CSS Animations (`apps/web/src/index.css`)
**Objective**: Add sophisticated animations with spring physics and GPU acceleration.

**New Keyframes**:
```css
@keyframes spring-pulse {
  0% { transform: scale(1); }
  25% { transform: scale(1.15); }
  40% { transform: scale(0.95); }
  60% { transform: scale(1.05); }
  80% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

@keyframes spring-slide-up {
  0% { transform: translateY(20px) scale(0.95); opacity: 0; }
  50% { transform: translateY(-5px) scale(1.02); opacity: 1; }
  70% { transform: translateY(2px) scale(1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes spring-slide-down {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  30% { transform: translateY(-10px) scale(1.02); opacity: 1; }
  60% { transform: translateY(15px) scale(0.95); opacity: 1; }
  100% { transform: translateY(20px) scale(0.9); opacity: 0; }
}

@keyframes highlight-fade {
  0% { box-shadow: 0 0 0 4px var(--primary); opacity: 0; }
  50% { box-shadow: 0 0 0 8px var(--primary); opacity: 0.3; }
  100% { box-shadow: 0 0 0 0 var(--primary); opacity: 0; }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes loading-dots {
  0%, 20% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  80%, 100% { transform: scale(0.8); opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes success-check {
  0% { stroke-dashoffset: 24; transform: scale(0); }
  50% { stroke-dashoffset: 12; transform: scale(1.1); }
  100% { stroke-dashoffset: 0; transform: scale(1); }
}

/* Animation utility classes */
.animate-spring-pulse { animation: spring-pulse 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-spring-enter { animation: spring-slide-up 350ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-spring-exit { animation: spring-slide-down 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-highlight { animation: highlight-fade 600ms ease-out; }
.animate-ripple { animation: ripple 500ms ease-out; }
.animate-loading { animation: loading-dots 1.4s ease-in-out infinite; }
.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.animate-success-check { animation: success-check 400ms ease-out forwards; }

/* GPU-accelerated transitions */
.gpu-accelerated {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-spring-pulse,
  .animate-spring-enter,
  .animate-spring-exit,
  .animate-highlight,
  .animate-ripple,
  .animate-loading,
  .animate-shimmer {
    animation: none;
  }

  .gpu-accelerated {
    will-change: auto;
    transform: none;
  }
}
```

### Phase 2: Component-Specific Animations

#### 2.1 Product Card Animations (`apps/web/src/components/product-card.tsx`)
**Objective**: Add sophisticated hover, active, and focus states with spring physics.

**Changes**:
- Add spring-based hover scale effect
- Implement card highlight effect on interaction
- Add ripple effect on click (desktop)
- Enhance button animations with spring feedback
- Add keyboard navigation focus animations
- Implement card lift effect on hover

**Implementation**:
```typescript
// Add state for tracking interactions
const [isHovered, setIsHovered] = React.useState(false)
const [isPressed, setIsPressed] = React.useState(false)
const [showHighlight, setShowHighlight] = React.useState(false)

// Add ripple effect handler
const handleClick = (e: React.MouseEvent) => {
  createRipple(e)
  showHighlightAnimation()
}

// Enhanced button animations
<Button className="transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md" />
```

#### 2.2 Tally Product Card Enhancements (`apps/web/src/components/tally-product-card.tsx`)
**Objective**: Enhance existing animations with spring physics and better feedback.

**Changes**:
- Replace pulse animation with spring-pulse
- Add spring-based quantity badge animation
- Implement card highlight when quantity changes
- Add ripple effect on decrement button
- Enhance long-press visual feedback
- Add spring animation to card entrance

**Implementation**:
```typescript
// Replace existing pulse with spring
const handleQuantityChange = () => {
  setTriggerSpring(true)
  setShowHighlight(true)
  setTimeout(() => {
    setTriggerSpring(false)
    setShowHighlight(false)
  }, 400)
}

// Add highlight overlay
<div className={cn('absolute inset-0 rounded-none animate-highlight', showHighlight && 'pointer-events-none')} />
```

#### 2.3 Quantity Input Dialog Spring Transitions (`apps/web/src/components/quantity-input-dialog.tsx`)
**Objective**: Implement smooth spring-based modal enter/exit animations.

**Changes**:
- Enhance dialog backdrop transition with spring
- Add spring slide-up animation for content
- Implement staggered animations for child elements
- Add keyboard focus animations for keypad
- Add success animation on confirm
- Add error shake animation with spring

**Implementation**:
```typescript
// Update DialogContent with spring animations
<DialogContent className="animate-spring-enter" />

// Add staggered animations for keypad
<NumericKeypad className="stagger-children-50" />

// Add success feedback on confirm
{showSuccess && <SuccessIndicator className="animate-success-check" />}
```

#### 2.4 Button Component Spring Feedback (`apps/web/src/components/ui/button.tsx`)
**Objective**: Add satisfying spring-based touch feedback to all buttons.

**Changes**:
- Add spring-based press animation
- Implement ripple effect component
- Add hover lift effect
- Add focus ring animation
- Add loading state animation
- Ensure 60fps performance with GPU acceleration

**Implementation**:
```typescript
// Update buttonVariants with spring classes
const buttonVariants = cva(
  "transition-all duration-150 ease-out active:scale-95 hover:scale-102 focus-visible:scale-102",
  // ...existing variants
)

// Add optional ripple effect
{props.showRipple && <RippleEffect />}
```

#### 2.5 Dialog Component Enhanced Transitions (`apps/web/src/components/ui/dialog.tsx`)
**Objective**: Implement sophisticated spring-based modal animations.

**Changes**:
- Replace basic zoom with spring animation
- Add backdrop blur transition
- Implement scale + translate spring animation
- Add enter/exit stagger for children
- Add focus trap animations
- Add content slide animation

**Implementation**:
```typescript
// Update DialogBackdrop with spring
<DialogBackdrop className="data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out transition-all duration-300" />

// Update DialogContent with spring
<DialogPrimitive.Popup
  className="data-[state=open]:animate-spring-enter data-[state=closed]:animate-spring-exit transition-all duration-350"
/>
```

#### 2.6 Validation Components Enhanced (`apps/web/src/components/ui/validated-quantity-input.tsx`, `validation-error-message.tsx`)
**Objective**: Add sophisticated validation feedback animations.

**Changes**:
- Add spring-based error shake animation
- Implement success checkmark animation
- Add validation state transitions
- Add border color transition animations
- Add icon spring animations

**Implementation**:
```typescript
// Enhanced validation display
<div className={cn(
  'transition-all duration-300',
  hasError && 'animate-shake border-destructive',
  isValid && 'border-green-500'
)}>

// Success indicator with spring
<Check className={cn('animate-success-check', isValid && 'text-green-500')} />
```

### Phase 3: Loading States and Async Operations

#### 3.1 Loading State Component Enhancement (`apps/web/src/components/loading-state.tsx`)
**Objective**: Create sophisticated loading indicators with spring animations.

**Changes**:
- Add spring-based spinner animation
- Implement loading dots animation
- Add shimmer effect for skeleton loaders
- Create progress bar with spring transitions
- Add loading text animation
- Ensure reduced motion support

**Implementation**:
```typescript
// New loading variants
export type LoadingVariant = 'spinner' | 'dots' | 'shimmer' | 'progress'

// Enhanced component
export function LoadingState({ variant = 'spinner', ...props }) {
  return (
    <div className="animate-loading">
      {variant === 'spinner' && <SpringSpinner />}
      {variant === 'dots' && <LoadingDots />}
      {variant === 'shimmer' && <ShimmerEffect />}
    </div>
  )
}
```

#### 3.2 Create Ripple Effect Component (NEW)
**Objective**: Add satisfying ripple effects to interactive elements.

**File**: `apps/web/src/components/ui/ripple-effect.tsx`

**Implementation**:
```typescript
export function RippleEffect({ x, y, size = 100 }: RippleProps) {
  return (
    <span
      className="absolute rounded-full bg-current opacity-30 pointer-events-none animate-ripple"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
    />
  )
}
```

#### 3.3 Create Spring Indicator Component (NEW)
**Objective**: Reusable spring animation component for various use cases.

**File**: `apps/web/src/components/ui/spring-indicator.tsx`

**Implementation**:
```typescript
export function SpringIndicator({
  children,
  trigger,
  variant = 'pulse',
}: SpringIndicatorProps) {
  const animationClass = variant === 'pulse' ? 'animate-spring-pulse' : 'animate-spring-enter'

  return (
    <div className={cn(trigger && animationClass, 'gpu-accelerated')}>
      {children}
    </div>
  )
}
```

### Phase 4: Touch and Keyboard Interactions

#### 4.1 Enhanced Touch Feedback
**Objective**: Add spring-based touch feedback across all interactive elements.

**Changes**:
- Add touch start/end animations
- Implement haptic feedback integration (where supported)
- Add long-press visual feedback
- Add double-tap feedback animation
- Ensure touch target animations

#### 4.2 Keyboard Navigation Animations
**Objective**: Add smooth animations for keyboard navigation.

**Changes**:
- Add focus ring spring animation
- Implement keyboard trap animations
- Add arrow key navigation transitions
- Add Enter/Space key press animations

**Implementation**:
```typescript
// Focus ring with spring
<button
  className={cn(
    'transition-all duration-200',
    isFocused && 'ring-2 ring-primary ring-offset-2 animate-scale-in'
  )}
/>
```

### Phase 5: Performance Optimization

#### 5.1 GPU Acceleration
**Objective**: Ensure all animations use GPU-accelerated properties.

**Changes**:
- Add `transform: translateZ(0)` to animated elements
- Use `will-change` sparingly and strategically
- Implement animation cleanup hooks
- Use `requestAnimationFrame` for complex animations

#### 5.2 Animation Performance Monitoring
**Objective**: Create utilities to monitor and optimize animation performance.

**File**: `apps/web/src/lib/animation-performance.ts` (NEW)

**Implementation**:
```typescript
export function useAnimationFrame(callback: () => void, enabled: boolean)
export function measureAnimationPerformance(animationName: string)
export function getReducedMotionPreference(): boolean
export function optimizeAnimationForDevice(): AnimationConfig
```

#### 5.3 Reduced Motion Support
**Objective**: Full support for `prefers-reduced-motion` across all animations.

**Changes**:
- Respect system reduced motion preference
- Provide fallback non-animated states
- Ensure functionality without animations
- Add user preference override in settings

### Phase 6: Documentation and Testing

#### 6.1 Animation Documentation
**Objective**: Document all animation patterns and best practices.

**File**: `ANIMATION_GUIDE.md` (NEW)

**Content**:
- Animation system overview
- Usage examples for each component
- Performance best practices
- Accessibility considerations
- Customization guidelines

#### 6.2 Animation Testing
**Objective**: Ensure animations work correctly across devices and browsers.

**Testing Checklist**:
- Test animations on mobile browsers (iOS Safari, Chrome Android)
- Test animations on desktop browsers (Chrome, Firefox, Safari, Edge)
- Verify reduced motion support
- Test animation performance with profiling tools
- Verify 60fps target
- Test animations with large data sets
- Verify accessibility with screen readers

## File Changes Summary

### Files to Modify:
1. `apps/web/src/lib/animations.ts` - Expand with spring utilities
2. `apps/web/src/index.css` - Add spring keyframes and utility classes
3. `apps/web/src/components/product-card.tsx` - Enhanced animations
4. `apps/web/src/components/tally-product-card.tsx` - Spring animations
5. `apps/web/src/components/quantity-input-dialog.tsx` - Spring transitions
6. `apps/web/src/components/ui/button.tsx` - Spring feedback
7. `apps/web/src/components/ui/dialog.tsx` - Enhanced transitions
8. `apps/web/src/components/ui/validated-quantity-input.tsx` - Spring validation
9. `apps/web/src/components/ui/validation-error-message.tsx` - Enhanced feedback
10. `apps/web/src/components/loading-state.tsx` - Spring loading animations

### Files to Create:
1. `apps/web/src/components/ui/ripple-effect.tsx` - Ripple effect component
2. `apps/web/src/components/ui/spring-indicator.tsx` - Reusable spring component
3. `apps/web/src/lib/animation-performance.ts` - Performance utilities
4. `ANIMATION_GUIDE.md` - Animation documentation

## Success Criteria

✓ All animations maintain 60fps performance
✓ Spring-based animations provide satisfying feedback
✓ Reduced motion preference is respected everywhere
✓ Touch targets have satisfying feedback
✓ Modal transitions are smooth and springy
✓ Loading states are informative and animated
✓ Validation feedback is clear and animated
✓ Hover states are subtle but noticeable
✓ Active states provide immediate feedback
✓ All animations use GPU-accelerated properties
✓ Animations enhance UX without being distracting
✓ Cross-browser compatibility confirmed
✓ Accessibility requirements met

## Implementation Order

1. Phase 1: Animation Infrastructure Enhancement
2. Phase 3: Loading States and Async Operations (parallel with Phase 2)
3. Phase 2: Component-Specific Animations
4. Phase 4: Touch and Keyboard Interactions
5. Phase 5: Performance Optimization
6. Phase 6: Documentation and Testing

## Estimated Effort

- Phase 1: 4 hours
- Phase 2: 6 hours
- Phase 3: 3 hours
- Phase 4: 3 hours
- Phase 5: 4 hours
- Phase 6: 2 hours

**Total**: ~22 hours

## Dependencies

None - This task can be implemented independently
