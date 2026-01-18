import type { NavigateOptions } from "@tanstack/react-router"

interface NavigationOptions extends NavigateOptions {
  force?: boolean
}

export interface NavigationResult {
  success: boolean
  cancelled: boolean
}

export function createNavigationPromise(
  destination: string,
  options: NavigationOptions = {}
): Promise<NavigationResult> {
  return new Promise((resolve, reject) => {
    if (options.force) {
      resolve({ success: true, cancelled: false })
    } else {
      resolve({ success: false, cancelled: true })
    }
  })
}
