import { HeadContent, Outlet, createRootRouteWithContext, useNavigate, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "../index.css";

export type RouterAppContext = Record<string, unknown>;

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
});

function RootComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("has-reloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("has-reloaded", "true");
    } else {
      if (location.pathname !== "/") {
        navigate({ to: "/" });
      }
    }
  }, [navigate, location.pathname]);

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
