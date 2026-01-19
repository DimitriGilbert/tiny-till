import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ArrowRight, BookOpen, Zap, Shield, HelpCircle } from "lucide-react"

export const Route = createFileRoute("/docs/")({
  component: DocsIndex,
})

function DocsIndex() {
  const sections = [
    {
      title: "Getting Started",
      description: "Learn the basics of Tiny-Till and get up and running quickly",
      icon: Zap,
      href: "/docs/getting-started",
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
    {
      title: "Features",
      description: "Explore all the powerful features Tiny-Till has to offer",
      icon: BookOpen,
      href: "/docs/features",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "Backup & Restore",
      description: "Protect your product catalog with backup and restore functionality",
      icon: Shield,
      href: "/docs/backup-restore",
      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Troubleshooting",
      description: "Find solutions to common issues and get help when you need it",
      icon: HelpCircle,
      href: "/docs/troubleshooting",
      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  ] as const

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
          Welcome to Tiny-Till Documentation
        </h1>
        <p className="text-xl text-muted-foreground">
          Your complete guide to using Tiny-Till for quick, accurate tallying
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              to={section.href}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
            >
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${section.color} opacity-10 transition-opacity group-hover:opacity-20`} />
              <div className="relative flex items-start gap-4">
                <div className={`rounded-xl p-3 ${section.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-primary">
                    Start reading
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 rounded-2xl border bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-950/20 dark:to-pink-950/20 p-8">
        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <a
            href="/docs/getting-started#your-first-tally"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Your first tally in 5 minutes
          </a>
          <a
            href="/docs/features#tally-system"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            How to use the tally system
          </a>
          <a
            href="/docs/backup-restore#exporting-your-catalog"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Export your product catalog
          </a>
          <a
            href="/docs/troubleshooting#storage-quota-exceeded"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Fix storage quota issues
          </a>
        </div>
      </div>
    </div>
  )
}
