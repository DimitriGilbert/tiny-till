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
        className={`flex items-center text-muted-foreground hover:text-foreground transition-colors ${focusVisibleStyles}`}
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.href}
              className={`text-muted-foreground hover:text-foreground transition-colors ${focusVisibleStyles}`}
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
