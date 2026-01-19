import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { ChevronDown, ChevronRight, LayoutDashboard, Settings, FileText, HelpCircle, BookOpen, Zap, Shield } from "lucide-react"
import { useState } from "react"
import { focusVisibleStyles } from "@/lib/focus-styles"

interface DocSection {
  title: string
  icon: typeof LayoutDashboard
  path: string
  children?: DocSubSection[]
}

interface DocSubSection {
  title: string
  path: string
}

const NAVIGATION: DocSection[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    path: "/docs",
  },
  {
    title: "Getting Started",
    icon: Zap,
    path: "/docs/getting-started",
    children: [
      { title: "Introduction", path: "/docs/getting-started" },
      { title: "Installation", path: "/docs/getting-started#installation--access" },
      { title: "First-Time Setup", path: "/docs/getting-started#first-time-setup" },
      { title: "Your First Tally", path: "/docs/getting-started#your-first-tally" },
    ],
  },
  {
    title: "Features",
    icon: BookOpen,
    path: "/docs/features",
    children: [
      { title: "Product Catalog", path: "/docs/features#product-catalog-management" },
      { title: "Tally System", path: "/docs/features#tally-system" },
      { title: "Settings", path: "/docs/features#settings--customization" },
      { title: "Offline Support", path: "/docs/features#offline-support" },
      { title: "Mobile Optimization", path: "/docs/features#mobile-optimization" },
      { title: "Keyboard Navigation", path: "/docs/features#keyboard-navigation" },
    ],
  },
  {
    title: "Backup & Restore",
    icon: Shield,
    path: "/docs/backup-restore",
    children: [
      { title: "Exporting Catalog", path: "/docs/backup-restore#exporting-your-catalog" },
      { title: "Importing Catalog", path: "/docs/backup-restore#importing-your-catalog" },
      { title: "Best Practices", path: "/docs/backup-restore#backup-best-practices" },
      { title: "Troubleshooting", path: "/docs/backup-restore#troubleshooting-backuprestore" },
    ],
  },
  {
    title: "Troubleshooting",
    icon: HelpCircle,
    path: "/docs/troubleshooting",
    children: [
      { title: "Storage Issues", path: "/docs/troubleshooting#storage-quota-exceeded" },
      { title: "Import/Export Errors", path: "/docs/troubleshooting#importexport-errors" },
      { title: "Display Issues", path: "/docs/troubleshooting#display-issues" },
      { title: "Offline Problems", path: "/docs/troubleshooting#networkoffline-issues" },
      { title: "Data Loss", path: "/docs/troubleshooting#data-loss" },
    ],
  },
]

function Section({ section, isActive }: { section: DocSection; isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(isActive)
  const hasChildren = section.children && section.children.length > 0

  return (
    <div className="mb-2">
      <Link
        to={section.path}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${focusVisibleStyles}`}
      >
        <section.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{section.title}</span>
        {hasChildren && (
          <span className="ml-auto">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="mt-1 ml-4 space-y-1">
          {section.children!.map((child) => {
            const isChildActive = window.location.hash === child.path.split("#")[1] || false
            return (
              <Link
                key={child.path}
                to={child.path}
                className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isChildActive
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${focusVisibleStyles}`}
              >
                {child.title}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DocsSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <nav className="p-4" aria-label="Documentation navigation">
      <div className="mb-6">
        <Link
          to="/"
          className={`flex items-center gap-2 text-lg font-bold text-foreground hover:text-primary transition-colors ${focusVisibleStyles}`}
        >
          <FileText className="h-6 w-6" />
          <span>Tiny-Till Docs</span>
        </Link>
      </div>

      <div className="space-y-1">
        {NAVIGATION.map((section) => {
          const isActive = currentPath === section.path || currentPath.startsWith(section.path + "/")
          return <Section key={section.path} section={section} isActive={isActive} />
        })}
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Quick Links</span>
          </div>
          <Link
            to="/settings"
            className={`block px-3 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${focusVisibleStyles}`}
          >
            App Settings
          </Link>
          <Link
            to="/settings/catalog"
            className={`block px-3 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${focusVisibleStyles}`}
          >
            Manage Catalog
          </Link>
        </div>
      </div>
    </nav>
  )
}
