import * as React from 'react'

import { HelpBubble } from '@/components/help/help-bubble'
import { useHelpStore } from '@/stores/help-store'
import type { HelpContent } from '@/lib/help-content-index'

export interface BubbleConfig {
  id: string
  contentId: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  variant?: 'icon' | 'badge' | 'inline'
  trigger?: 'hover' | 'click' | 'focus'
  priority?: number
  showOnMount?: boolean
}

interface HelpBubbleManagerProps {
  bubbles: BubbleConfig[]
  helpContent: HelpContent[]
  autoShow?: boolean
  bubbleDelay?: number
}

export function HelpBubbleManager({
  bubbles,
  helpContent,
  autoShow = true,
  bubbleDelay = 3000,
}: HelpBubbleManagerProps) {
  const { hasSeenBubble, dismissBubble, trackBubbleView, onboardingComplete } = useHelpStore()

  const [visibleBubbles, setVisibleBubbles] = React.useState<Set<string>>(new Set())
  const [currentBubbleIndex, setCurrentBubbleIndex] = React.useState(0)

  React.useEffect(() => {
    if (!autoShow || onboardingComplete) return

    const sortedBubbles = [...bubbles].sort((a, b) => {
      const priorityA = a.priority ?? 50
      const priorityB = b.priority ?? 50
      return priorityA - priorityB
    })

    sortedBubbles.forEach((bubble) => {
      if (!hasSeenBubble(bubble.id) && bubble.showOnMount) {
        const timer = setTimeout(() => {
          setVisibleBubbles((prev) => new Set(prev).add(bubble.id))
          trackBubbleView(bubble.id)
        }, bubbleDelay)
        return () => clearTimeout(timer)
      }
    })
  }, [autoShow, onboardingComplete, bubbleDelay, bubbles, hasSeenBubble, trackBubbleView])

  const handleDismiss = (bubbleId: string) => {
    setVisibleBubbles((prev) => {
      const next = new Set(prev)
      next.delete(bubbleId)
      return next
    })
    dismissBubble(bubbleId)

    const remainingBubbles = bubbles.filter((b) => !hasSeenBubble(b.id) && b.id !== bubbleId)
    if (remainingBubbles.length > 0 && currentBubbleIndex < remainingBubbles.length) {
      setCurrentBubbleIndex((prev) => prev + 1)
      setTimeout(() => {
        const nextBubble = remainingBubbles[currentBubbleIndex]
        if (nextBubble) {
          setVisibleBubbles((prev) => new Set(prev).add(nextBubble.id))
          trackBubbleView(nextBubble.id)
        }
      }, bubbleDelay)
    }
  }

  const getHelpContent = (contentId: string): HelpContent | undefined => {
    return helpContent.find((item) => item.id === contentId)
  }

  return (
    <>
      {bubbles.map((bubble) => {
        if (!visibleBubbles.has(bubble.id)) return null

        const content = getHelpContent(bubble.contentId)
        if (!content) return null

        return (
          <div key={bubble.id}>
            <HelpBubble
              id={bubble.id}
              content={content.content}
              position={bubble.position}
              variant={bubble.variant}
              trigger={bubble.trigger}
              onDismiss={() => handleDismiss(bubble.id)}
            />
          </div>
        )
      })}
    </>
  )
}
