import { useStorage } from '@/hooks/use-storage'
import { cn } from '@/lib/utils'

export function HydrateLoader({ children }: { children: React.ReactNode }) {
  const { isHydrated } = useStorage()

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-400 opacity-20 dark:bg-purple-600" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg shadow-purple-500/30 dark:from-purple-600 dark:via-pink-600 dark:to-blue-600">
              <svg
                className="h-10 w-10 animate-bounce text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="Loading animation"
              >
                <title>Loading</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-medium text-purple-700 dark:text-purple-300">
              Loading your tiny till...
            </p>
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.4s] dark:bg-purple-500" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.2s] dark:bg-pink-500" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0s] dark:bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <div className={cn(isHydrated && 'animate-in fade-in duration-300')}>{children}</div>
}
