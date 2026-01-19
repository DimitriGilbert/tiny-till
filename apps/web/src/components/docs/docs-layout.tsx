import { Outlet } from "@tanstack/react-router"
import DocsSidebar from "./docs-sidebar"
import DocsBreadcrumbs from "./docs-breadcrumbs"
import DocsSearch from "./docs-search"

export default function DocsLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-muted/20">
      <aside className="hidden lg:block w-72 border-r bg-muted/10 sticky top-0 h-screen overflow-y-auto">
        <DocsSidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden border-b bg-muted/10">
          <DocsSidebar />
        </div>
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
            <div className="mb-6">
              <DocsSearch />
            </div>
            <DocsBreadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
