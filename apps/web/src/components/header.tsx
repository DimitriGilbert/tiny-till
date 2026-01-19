import type { NavigateOptions } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { ModeToggle } from "./mode-toggle"
import { focusVisibleStyles } from "@/lib/focus-styles"

interface HeaderProps {
  navigateWithCheck: (to: string, options?: NavigateOptions) => void
}

export default function Header({ navigateWithCheck }: HeaderProps) {
  const location = useLocation()
  const links = [
    { to: "/", label: "Tally" },
    { to: "/settings", label: "Settings" },
    { to: "/docs", label: "Docs" },
  ] as const

  return (
    <header>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav aria-label="Main navigation" className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to
            const dataOnboarding = to === '/settings' ? 'settings-link' : undefined
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigateWithCheck(to)}
                aria-current={isActive ? "page" : undefined}
                className={focusVisibleStyles}
                data-onboarding={dataOnboarding}
              >
                {label}
              </button>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </header>
  )
}
