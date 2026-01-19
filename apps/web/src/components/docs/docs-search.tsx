import { Search, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useLocation, Link } from "@tanstack/react-router"
import { focusVisibleStyles } from "@/lib/focus-styles"

interface DocSearchResult {
  id: string
  title: string
  excerpt: string
  path: string
  relevance: number
}

interface DocSection {
  title: string
  path: string
  content: string
  sections: Array<{
    title: string
    id: string
    content: string
  }>
}

const DOCS_CONTENT: DocSection[] = [
  {
    title: "Getting Started",
    path: "/docs/getting-started",
    content: "Introduction to Tiny-Till Installation Access First-Time Setup Your First Tally Next Steps",
    sections: [
      { title: "Introduction", id: "introduction-to-tiny-till", content: "What makes Tiny-Till different Who is it for" },
      { title: "Installation", id: "installation--access", content: "Opening app PWA installation Browser requirements" },
      { title: "First-Time Setup", id: "first-time-setup", content: "Initial app load Understanding interface Navigation basics" },
      { title: "Your First Tally", id: "your-first-tally", content: "Add products Start tally Adding items Viewing totals Clearing tally" },
    ],
  },
  {
    title: "Features",
    path: "/docs/features",
    content: "Product Catalog Management Tally System Settings Customization Offline Support Mobile Optimization Keyboard Navigation",
    sections: [
      { title: "Product Catalog", id: "product-catalog-management", content: "Adding products Editing products Deleting products Exporting catalog Importing catalog" },
      { title: "Tally System", id: "tally-system", content: "Adding items to tally Viewing totals Managing tally" },
      { title: "Settings", id: "settings--customization", content: "Theme selection Grid density Column count override Backup reminders" },
      { title: "Offline Support", id: "offline-support", content: "Service worker Local storage" },
      { title: "Mobile Optimization", id: "mobile-optimization", content: "Touch targets Responsive design Touch-friendly inputs" },
      { title: "Keyboard Navigation", id: "keyboard-navigation", content: "Keyboard shortcuts Accessibility" },
    ],
  },
  {
    title: "Backup & Restore",
    path: "/docs/backup-restore",
    content: "Why Backup Exporting Catalog Importing Catalog Troubleshooting Recovery from Corrupt Data",
    sections: [
      { title: "Exporting Catalog", id: "exporting-your-catalog", content: "Step-by-step export File format Export best practices" },
      { title: "Importing Catalog", id: "importing-your-catalog", content: "Step-by-step import Import preview Import options Import validation" },
      { title: "Best Practices", id: "backup-best-practices", content: "Frequency recommendations Storage recommendations Quality checks" },
      { title: "Troubleshooting", id: "troubleshooting-backuprestore", content: "Common issues File not found Invalid format Version mismatch Quota exceeded" },
    ],
  },
  {
    title: "Troubleshooting",
    path: "/docs/troubleshooting",
    content: "Common Issues Storage Quota Import Export Errors Display Issues Network Offline Issues Performance Issues Data Loss Browser Specific Issues",
    sections: [
      { title: "Storage Quota", id: "storage-quota-exceeded", content: "Symptoms Causes Solutions Prevention" },
      { title: "Import/Export Errors", id: "importexport-errors", content: "Invalid file format Version mismatch Corrupt JSON" },
      { title: "Display Issues", id: "display-issues", content: "Clear cache Browser compatibility Service worker" },
      { title: "Offline Issues", id: "networkoffline-issues", content: "Service worker installation Cache issues Network policies" },
      { title: "Performance Issues", id: "performance-issues", content: "Optimize catalog Virtual scrolling Browser optimizations" },
      { title: "Data Loss", id: "data-loss", content: "Normal mode Recover from backup IndexedDB" },
    ],
  },
]

function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  let score = 0

  if (textLower === queryLower) return 100
  if (textLower.startsWith(queryLower)) score += 80
  if (textLower.includes(queryLower)) score += 60

  const words = queryLower.split(" ")
  const wordMatches = words.filter((word) => textLower.includes(word)).length
  score += (wordMatches / words.length) * 40

  return score
}

function searchDocuments(query: string): DocSearchResult[] {
  if (!query.trim()) return []

  const results: DocSearchResult[] = []

  DOCS_CONTENT.forEach((doc) => {
    const docRelevance = calculateRelevance(query, doc.title)
    if (docRelevance > 0) {
      results.push({
        id: doc.path,
        title: doc.title,
        excerpt: doc.content.slice(0, 100) + "...",
        path: doc.path,
        relevance: docRelevance,
      })
    }

    doc.sections.forEach((section) => {
      const sectionRelevance = calculateRelevance(query, section.title)
      const contentRelevance = calculateRelevance(query, section.content)

      const maxRelevance = Math.max(sectionRelevance, contentRelevance)

      if (maxRelevance > 0) {
        results.push({
          id: `${doc.path}#${section.id}`,
          title: `${doc.title} - ${section.title}`,
          excerpt: section.content.slice(0, 100) + "...",
          path: `${doc.path}#${section.id}`,
          relevance: maxRelevance * 0.9,
        })
      }
    })
  })

  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10)
}

export default function DocsSearch() {
  const location = useLocation()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const results = useMemo(() => searchDocuments(query), [query])

  useEffect(() => {
    if (results.length > 0) {
      setSelectedIndex(0)
    } else {
      setSelectedIndex(-1)
    }
  }, [results])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          window.location.href = results[selectedIndex].path
        }
        break
      case "Escape":
        setIsFocused(false)
        break
    }
  }

  const handleResultClick = (path: string) => {
    setQuery("")
    setIsFocused(false)
    window.location.href = path
  }

  return (
    <div className="relative">
      <div className={`relative transition-all duration-200 ${isFocused ? "ring-2 ring-primary/50 rounded-lg" : ""}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search documentation..."
          className={`w-full pl-10 pr-10 py-2 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${focusVisibleStyles}`}
          aria-label="Search documentation"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors ${focusVisibleStyles}`}
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isFocused && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <a
              key={result.id}
              href={result.path}
              onClick={(e) => {
                e.preventDefault()
                handleResultClick(result.path)
              }}
              className={`block px-4 py-3 hover:bg-muted transition-colors cursor-pointer ${
                index === selectedIndex ? "bg-muted" : ""
              } ${focusVisibleStyles}`}
            >
              <div className="font-medium text-foreground">{result.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.excerpt}</div>
            </a>
          ))}
        </div>
      )}

      {isFocused && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 px-4 py-3">
          <div className="text-muted-foreground">No results found for "{query}"</div>
          <div className="text-sm text-muted-foreground mt-1">
            Try different keywords or browse the documentation.
          </div>
        </div>
      )}
    </div>
  )
}
