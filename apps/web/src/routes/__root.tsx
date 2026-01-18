import { HeadContent, Outlet, createRootRouteWithContext, useNavigate, useLocation, useRouter } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"

import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationConfirmationDialog } from "@/components/navigation-confirmation-dialog"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Toaster } from "@/components/ui/sonner"
import { useTallyStore } from "@/stores/tally-store"
import { useTallyNavigationGuard } from "@/lib/route-guards"

import "../index.css"

export type RouterAppContext = Record<string, unknown>

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "tiny-till",
      },
      {
        name: "description",
        content: "tiny-till is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
})

function RootComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const { hasActiveItems, clearTally } = useTallyStore()
  const { isModalOpen, navigateWithCheck, handleConfirm, handleCancel } = useTallyNavigationGuard(
    hasActiveItems,
    clearTally
  )

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("has-reloaded")
    if (!hasReloaded) {
      sessionStorage.setItem("has-reloaded", "true")
    } else {
      if (location.pathname !== "/") {
        navigate({ to: "/" })
      }
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasActiveItems()) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasActiveItems])

  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Header navigateWithCheck={navigateWithCheck} />
          <Outlet />
        </div>
        <Toaster richColors />
        <LoadingOverlay />
        <NavigationConfirmationDialog
          open={isModalOpen}
          onOpenChange={handleCancel}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}
