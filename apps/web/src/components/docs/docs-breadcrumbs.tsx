import { Link, useLocation } from "@tanstack/react-router"
import { ChevronRight, Home } from "lucide-react"
import { focusVisibleStyles } from "@/lib/focus-styles"

function DocsBreadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  const generateBreadcrumbs = () => {
    const paths: { label: string; href: string }[] = []

    if (pathname === "/docs") {
      paths.push({ label: "Documentation", href: "/docs" })
      return paths
    }

    paths.push({ label: "Documentation", href: "/docs" })

    const pathSegments = pathname.split("/").filter(Boolean)
    if (pathSegments.length > 1 && pathSegments[0] === "docs") {
      const pageName = pathSegments[1]
      const formattedName = pageName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      paths.push({ label: formattedName, href: pathname })
    }

    return paths
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length === 1) return null

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <Link
        to="/"
        className={`flex items-center px-2 py-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 ${focusVisibleStyles}`}
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-kawaii-acid-green mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-display font-medium text-primary px-2 py-1 rounded-lg bg-primary/10">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.href}
              className={`px-2 py-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 ${focusVisibleStyles}`}
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default DocsBreadcrumbs
