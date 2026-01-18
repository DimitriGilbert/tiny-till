import type { NavigateOptions } from "@tanstack/react-router"
import { ModeToggle } from "./mode-toggle"

interface HeaderProps {
  navigateWithCheck: (to: string, options?: NavigateOptions) => void
}

export default function Header({ navigateWithCheck }: HeaderProps) {
  const links = [
    { to: "/", label: "Tally" },
    { to: "/settings", label: "Settings" },
  ] as const

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigateWithCheck(to)}
                className="hover:text-foreground/80 transition-colors"
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
    </div>
  )
}
