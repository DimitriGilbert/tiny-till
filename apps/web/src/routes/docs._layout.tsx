import { Outlet, createFileRoute } from "@tanstack/react-router"
import DocsLayout from "@/components/docs/docs-layout"

export const Route = createFileRoute("/docs/_layout")({
  component: DocsLayout,
})
