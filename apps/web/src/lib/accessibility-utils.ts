export type LiveRegionPriority = 'polite' | 'assertive'

export type KeyHandlers = Record<
  string,
  (event: KeyboardEvent) => void
>

let liveRegionElement: HTMLDivElement | null = null

export function announceToScreenReader(
  message: string,
  priority: LiveRegionPriority = 'polite'
): void {
  if (typeof document === 'undefined') return

  if (!liveRegionElement) {
    liveRegionElement = document.createElement('div')
    liveRegionElement.setAttribute('aria-live', priority)
    liveRegionElement.setAttribute('aria-atomic', 'true')
    liveRegionElement.className =
      'sr-only absolute -left-[9999px] w-px h-px overflow-hidden'
    document.body.appendChild(liveRegionElement)
  } else {
    liveRegionElement.setAttribute('aria-live', priority)
  }

  liveRegionElement.textContent = ''

  requestAnimationFrame(() => {
    liveRegionElement!.textContent = message
  })
}

export function trapFocusInElement(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  const focusFirstElement = () => {
    firstElement?.focus()
  }

  container.addEventListener('keydown', handleTabKey)
  setTimeout(focusFirstElement, 50)

  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

export function getFocusableElements(
  container: HTMLElement
): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ]

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  ).filter(
    (element) =>
      element.offsetWidth > 0 ||
      element.offsetHeight > 0 ||
      element.getClientRects().length > 0
  )
}

export function setAriaLiveRegion(
  element: HTMLElement,
  value: LiveRegionPriority
): void {
  element.setAttribute('aria-live', value)
}

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  handlers: KeyHandlers
): void {
  const handler = handlers[event.key]

  if (handler) {
    handler(event)
  }
}

export function createKeyboardHandler(
  key: string,
  handler: (event: KeyboardEvent) => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key === key) {
      handler(event)
    }
  }
}

export function createArrowKeyHandler(
  onUp: () => void,
  onDown: () => void,
  onLeft: () => void,
  onRight: () => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        onUp()
        break
      case 'ArrowDown':
        event.preventDefault()
        onDown()
        break
      case 'ArrowLeft':
        event.preventDefault()
        onLeft()
        break
      case 'ArrowRight':
        event.preventDefault()
        onRight()
        break
    }
  }
}

export function isElementInView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function scrollIntoViewIfNeeded(element: HTMLElement): void {
  if (!isElementInView(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }
}

export function createEscapeHandler(
  callback: () => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      callback()
    }
  }
}

export function createEnterHandler(
  callback: () => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      callback()
    }
  }
}

export function manageFocus(
  element: HTMLElement,
  shouldFocus: boolean
): void {
  if (shouldFocus) {
    element.focus()
  } else {
    element.blur()
  }
}
