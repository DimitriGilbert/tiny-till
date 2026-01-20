import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/github-dark.css"
import { focusVisibleStyles } from "@/lib/focus-styles"
import { ExternalLink, Sparkles } from "lucide-react"
import { useState } from "react"
import { KawaiiSparkle } from "@/components/kawaii"

interface DocsContentProps {
  markdown: string
}

export default function DocsContent({ markdown }: DocsContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-5xl prose-lg relative mx-auto">
      <div className="absolute -top-6 -right-6 opacity-20">
        <KawaiiSparkle size="md" color="acid-green" />
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ children, id }) => (
            <div className="relative">
              <div className="absolute -left-4 -top-2 opacity-30">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 id={id} className="text-4xl font-display font-bold mb-6 mt-8 scroll-mt-24 text-transparent bg-clip-text bg-gradient-to-r from-primary via-kawaii-lavender to-primary">
                {children}
              </h1>
            </div>
          ),
          h2: ({ children, id }) => (
            <div className="relative mt-12 mb-4">
              <h2 id={id} className="text-3xl font-display font-semibold scroll-mt-24 text-primary flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-kawaii-acid-green" />
                {children}
              </h2>
              <div className="h-0.5 w-24 mt-2 bg-gradient-to-r from-kawaii-acid-green via-kawaii-acid-yellow to-transparent rounded-full" />
            </div>
          ),
          h3: ({ children, id }) => (
            <h3 id={id} className="text-2xl font-semibold mb-3 mt-8 scroll-mt-24 text-kawaii-lavender">
              {children}
            </h3>
          ),
          h4: ({ children, id }) => (
            <h4 id={id} className="text-xl font-semibold mb-2 mt-6 scroll-mt-24 text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-7 text-muted-foreground">{children}</p>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http")
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={`text-primary hover:text-kawaii-acid-green transition-all duration-200 hover:underline hover:underline-offset-4 hover:decoration-wavy inline-flex items-center gap-1 ${focusVisibleStyles}`}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            )
          },
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 marker:text-kawaii-acid-green">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 marker:text-kawaii-lavender">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-2 leading-7 text-muted-foreground">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          code: ({ className, children }) => {
            const content = String(children).replace(/\n$/, "")
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const isInline = !match && content.indexOf("\n") === -1

            if (isInline) {
              return (
                <code className="bg-gradient-to-r from-kawaii-mint/20 to-kawaii-acid-green/20 px-2 py-1 rounded-lg text-sm font-mono text-foreground border border-kawaii-acid-green/20">
                  {children}
                </code>
              )
            }
            return (
              <div className="relative group mb-4 mt-4 rounded-2xl overflow-hidden border border-kawaii-lavender/20 shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-kawaii-pink/10 to-kawaii-lavender/10 border-b border-kawaii-lavender/20">
                  <span className="text-xs font-accent font-medium text-kawaii-hot-pink">{language || "code"}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(content)}
                    className={`text-xs px-3 py-1.5 rounded-xl bg-primary hover:bg-kawaii-acid-green text-primary-foreground hover:text-foreground transition-all duration-200 hover:scale-105 ${focusVisibleStyles}`}
                  >
                    {copiedCode === content ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="!m-0 !rounded-t-none overflow-x-auto p-4 bg-muted/30">
                  <code className={className}>{children}</code>
                </pre>
              </div>
            )
          },
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-kawaii-acid-green pl-6 italic my-6 bg-gradient-to-r from-kawaii-acid-green/10 to-transparent py-4 rounded-r-xl">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-kawaii-lavender/30 shadow-lg shadow-primary/5">
              <table className="min-w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-primary/10 to-kawaii-lavender/10">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-kawaii-lavender/20">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-muted-foreground border-b border-kawaii-lavender/10 last:border-b-0">
              {children}
            </td>
          ),
          hr: () => (
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-kawaii-acid-yellow opacity-50" />
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-kawaii-lavender to-transparent" />
            </div>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-2xl shadow-lg my-6 border border-kawaii-lavender/20"
              loading="lazy"
            />
          ),
          video: ({ src, controls }) => (
            <div className="relative my-6 rounded-2xl overflow-hidden shadow-lg border border-kawaii-lavender/20">
              <video
                src={src}
                controls={controls}
                className="w-full max-w-2xl"
              >
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
          details: ({ children }) => (
            <details className="my-4 rounded-2xl border border-kawaii-lavender/20 bg-gradient-to-r from-kawaii-mint/5 to-kawaii-acid-green/5">
              {children}
            </details>
          ),
          summary: ({ children }) => (
            <summary className="cursor-pointer px-4 py-3 font-semibold hover:bg-kawaii-lavender/10 transition-all duration-200 select-none flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 text-kawaii-acid-yellow" />
              {children}
            </summary>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
