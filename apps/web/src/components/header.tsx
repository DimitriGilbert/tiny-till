import type { NavigateOptions } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { ModeToggle } from "./mode-toggle"
import { focusVisibleStyles } from "@/lib/focus-styles"
import { cn } from "@/lib/utils"
import { KawaiiSparkle } from "@/components/kawaii"

interface HeaderProps {
  navigateWithCheck: (to: string, options?: NavigateOptions) => void
}

export default function Header({ navigateWithCheck }: HeaderProps) {
  const location = useLocation()
  const links = [
    { to: "/", label: "Tally", emoji: "🌸" },
    { to: "/catalog", label: "Catalog", emoji: "🛒" },
    { to: "/settings", label: "Settings", emoji: "⚙️" },
    { to: "/docs", label: "Docs", emoji: "📖" },
  ] as const

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-2 py-3 sm:px-4">
        <div className="relative flex items-center justify-between rounded-full bg-gradient-to-r from-primary via-kawaii-lavender to-primary px-4 py-2 shadow-lg shadow-primary/20 backdrop-blur-sm">
          <div className="absolute -top-2 -left-2">
            <KawaiiSparkle size="sm" color="acid-yellow" delay={200} />
          </div>
          <div className="absolute -top-1 right-8">
            <KawaiiSparkle size="sm" color="acid-green" delay={600} />
          </div>

          <nav aria-label="Main navigation" className="flex gap-2 sm:gap-4">
            {links.map(({ to, label, emoji }) => {
              const isActive = location.pathname === to
              const dataOnboarding = to === '/settings' ? 'settings-link' : undefined
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigateWithCheck(to)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 sm:px-4 sm:text-base",
                    "hover:scale-105 hover:shadow-lg hover:shadow-primary/30",
                    "active:scale-95",
                    isActive
                      ? "bg-white/90 text-primary shadow-lg shadow-primary/30 scale-105"
                      : "bg-white/50 text-foreground hover:bg-white/80",
                    focusVisibleStyles
                  )}
                  data-onboarding={dataOnboarding}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">{emoji}</span>
                    <span>{label}</span>
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary animate-acid-glow" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>

          <div className="absolute -bottom-2 -right-3">
            <KawaiiSparkle size="md" color="pink" delay={400} />
          </div>
        </div>
      </div>
    </header>
  )
}
