import { Outlet } from "@tanstack/react-router"
import DocsSidebar from "./docs-sidebar"
import DocsBreadcrumbs from "./docs-breadcrumbs"
import DocsSearch from "./docs-search"
import { KawaiiSparkle } from "@/components/kawaii"

export default function DocsLayout() {
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-background via-primary/5 to-kawaii-lavender/5">
      <aside className="hidden lg:block w-72 border-r border-kawaii-lavender/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md sticky top-0 h-screen overflow-y-auto shadow-xl shadow-primary/5">
        <DocsSidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden border-b border-kawaii-lavender/20 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-md">
          <DocsSidebar />
        </div>
        <main className="flex-1 relative">
          <div className="absolute -top-8 left-8 opacity-30">
            <KawaiiSparkle size="lg" color="pink" delay={200} />
          </div>
          <div className="absolute top-20 right-12 opacity-30">
            <KawaiiSparkle size="md" color="acid-green" delay={600} />
          </div>
          <div className="absolute bottom-20 left-20 opacity-20">
            <KawaiiSparkle size="sm" color="acid-yellow" delay={900} />
          </div>

          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 relative">
              <div className="absolute -top-3 -left-3 opacity-40">
                <KawaiiSparkle size="sm" color="acid-yellow" />
              </div>
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
