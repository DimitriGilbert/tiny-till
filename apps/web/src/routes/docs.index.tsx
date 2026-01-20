import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ArrowRight, BookOpen, Zap, Shield, HelpCircle, Sparkles, Star } from "lucide-react"
import { KawaiiSparkle } from "@/components/kawaii"

export const Route = createFileRoute("/docs/")({
  component: DocsIndex,
})

function DocsIndex() {
  const sections = [
    {
      title: "Getting Started",
      description: "Learn the basics of Tiny-Till and get up and running quickly ✨",
      icon: Zap,
      href: "/docs/getting-started",
      color: "from-kawaii-acid-yellow to-kawaii-acid-green",
      textColor: "text-foreground",
      iconBg: "bg-kawaii-acid-yellow/20",
    },
    {
      title: "Features",
      description: "Explore all the powerful features Tiny-Till has to offer 🌸",
      icon: BookOpen,
      href: "/docs/features",
      color: "from-primary to-kawaii-lavender",
      textColor: "text-primary",
      iconBg: "bg-primary/20",
    },
    {
      title: "Backup & Restore",
      description: "Protect your product catalog with backup and restore functionality 💖",
      icon: Shield,
      href: "/docs/backup-restore",
      color: "from-kawaii-mint to-kawaii-acid-green",
      textColor: "text-kawaii-acid-green",
      iconBg: "bg-kawaii-mint/20",
    },
    {
      title: "Troubleshooting",
      description: "Find solutions to common issues and get help when you need it 🌈",
      icon: HelpCircle,
      href: "/docs/troubleshooting",
      color: "from-kawaii-hot-pink to-kawaii-lavender",
      textColor: "text-kawaii-hot-pink",
      iconBg: "bg-kawaii-hot-pink/20",
    },
  ] as const

  return (
    <div className="relative container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute -top-12 -right-12 opacity-20">
        <KawaiiSparkle size="lg" color="pink" />
      </div>
      <div className="absolute top-32 -left-8 opacity-20">
        <KawaiiSparkle size="md" color="acid-green" />
      </div>

      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-kawaii-lavender/20 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-accent text-primary">Documentation Hub</span>
          <Sparkles className="h-4 w-4 text-kawaii-acid-green" />
        </div>
        <h1 className="text-5xl font-display font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-kawaii-lavender to-primary animate-gradient">
          Welcome to Tiny-Till Docs ✨
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your kawaii guide to using Tiny-Till for quick, accurate tallying! Let's make tallying fun! 🌸
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              to={section.href}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-muted/30 border border-kawaii-lavender/20 p-6 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:border-kawaii-lavender/40"
            >
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${section.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10 blur-2xl`} />
              <div className="relative flex items-start gap-4">
                <div className={`rounded-2xl p-3 ${section.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-6 w-6 ${section.textColor}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-display font-semibold mb-2 transition-colors duration-200 ${section.textColor}`}>
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center text-sm font-accent font-medium text-primary transition-all duration-200 group-hover:translate-x-1">
                    Let's go!
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-br from-kawaii-pink/10 via-primary/10 to-kawaii-lavender/10 border border-kawaii-lavender/20 p-8 shadow-lg shadow-primary/5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-20">
          <Star className="h-12 w-12 text-kawaii-acid-yellow" />
        </div>
        <div className="absolute -bottom-6 -left-6 opacity-20">
          <Star className="h-12 w-12 text-kawaii-acid-green" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-display font-semibold text-primary">Quick Links 🎀</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="/docs/getting-started#your-first-tally"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] text-muted-foreground hover:text-primary group"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              Your first tally in 5 minutes
            </a>
            <a
              href="/docs/features#tally-system"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] text-muted-foreground hover:text-primary group"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              How to use the tally system
            </a>
            <a
              href="/docs/backup-restore#exporting-your-catalog"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] text-muted-foreground hover:text-primary group"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              Export your product catalog
            </a>
            <a
              href="/docs/troubleshooting#storage-quota-exceeded"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] text-muted-foreground hover:text-primary group"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              Fix storage quota issues
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
