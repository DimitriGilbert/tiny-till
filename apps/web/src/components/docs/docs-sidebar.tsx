import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { ChevronDown, ChevronRight, LayoutDashboard, Settings, FileText, HelpCircle, BookOpen, Zap, Shield, Sparkles } from "lucide-react"
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
    <div className="mb-3">
      <Link
        to={section.path}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen)
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-primary to-kawaii-lavender text-primary-foreground font-display font-semibold shadow-lg shadow-primary/30 scale-105 border border-primary/20"
            : "text-muted-foreground hover:bg-gradient-to-r hover:from-kawaii-mint/10 hover:to-kawaii-acid-green/10 hover:text-foreground hover:scale-[1.02] border border-transparent hover:border-kawaii-lavender/20"
        } ${focusVisibleStyles}`}
      >
        <section.icon className="h-5 w-5 shrink-0" />
        <span className="truncate font-medium">{section.title}</span>
        {hasChildren && (
          <span className="ml-auto transition-transform duration-300">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="mt-2 ml-6 space-y-1 pl-4 border-l-2 border-dashed border-kawaii-lavender/30">
          {section.children!.map((child) => {
            const isChildActive = window.location.hash === child.path.split("#")[1] || false
            return (
              <Link
                key={child.path}
                to={child.path}
                className={`block px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                  isChildActive
                    ? "text-primary font-medium bg-gradient-to-r from-kawaii-mint/20 to-kawaii-acid-green/20 border-l-4 border-kawaii-acid-green"
                    : "text-muted-foreground hover:bg-gradient-to-r hover:from-kawaii-mint/10 hover:to-kawaii-acid-green/10 hover:text-foreground hover:border-l-2 hover:border-kawaii-lavender/30"
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
    <nav className="p-6" aria-label="Documentation navigation">
      <div className="mb-8">
        <Link
          to="/"
          className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-lg font-display font-bold text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-kawaii-lavender/10 hover:text-primary transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md ${focusVisibleStyles}`}
        >
          <div className="relative">
            <FileText className="h-6 w-6 text-primary group-hover:rotate-3 transition-transform duration-300" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-kawaii-acid-yellow" />
          </div>
          <span className="font-display">Tiny-Till Docs ✨</span>
        </Link>
      </div>

      <div className="space-y-2">
        {NAVIGATION.map((section) => {
          const isActive = currentPath === section.path || currentPath.startsWith(section.path + "/")
          return <Section key={section.path} section={section} isActive={isActive} />
        })}
      </div>

      <div className="mt-10 pt-6 border-t-2 border-dashed border-kawaii-lavender/30">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 font-medium text-foreground">
            <Settings className="h-4 w-4 text-kawaii-acid-green" />
            <span className="font-display">Quick Links</span>
          </div>
          <div className="space-y-2">
            <Link
              to="/settings"
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-kawaii-mint/10 hover:to-kawaii-acid-green/10 hover:text-foreground transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-kawaii-lavender/20 ${focusVisibleStyles}`}
            >
              <Sparkles className="h-3 w-3 text-kawaii-acid-green group-hover:rotate-12 transition-transform" />
              App Settings
            </Link>
            <Link
              // @ts-ignore - /catalog route exists, ignore type error
              to="/catalog"
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-kawaii-mint/10 hover:to-kawaii-acid-green/10 hover:text-foreground transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-kawaii-lavender/20 ${focusVisibleStyles}`}
            >
              <Sparkles className="h-3 w-3 text-kawaii-acid-yellow group-hover:rotate-12 transition-transform" />
              Manage Catalog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
