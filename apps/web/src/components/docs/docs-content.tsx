import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/github-dark.css"
import { focusVisibleStyles } from "@/lib/focus-styles"
import { ExternalLink } from "lucide-react"
import { useState } from "react"

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
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ children, id }) => (
            <h1 id={id} className="text-4xl font-bold mb-6 mt-8 scroll-mt-24">
              {children}
            </h1>
          ),
          h2: ({ children, id }) => (
            <h2 id={id} className="text-3xl font-semibold mb-4 mt-12 scroll-mt-24">
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3 id={id} className="text-2xl font-semibold mb-3 mt-8 scroll-mt-24">
              {children}
            </h3>
          ),
          h4: ({ children, id }) => (
            <h4 id={id} className="text-xl font-semibold mb-2 mt-6 scroll-mt-24">
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
                className={`text-primary hover:underline inline-flex items-center gap-1 ${focusVisibleStyles}`}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            )
          },
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 marker:text-primary/50">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 marker:text-primary/50">
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
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                  {children}
                </code>
              )
            }
            return (
              <div className="relative group mb-4 mt-4">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b rounded-t-lg">
                  <span className="text-xs font-medium text-muted-foreground">{language || "code"}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(content)}
                    className={`text-xs px-2 py-1 rounded bg-background hover:bg-muted transition-colors ${focusVisibleStyles}`}
                  >
                    {copiedCode === content ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="!m-0 !rounded-t-none overflow-x-auto">
                  <code className={className}>{children}</code>
                </pre>
              </div>
            )
          },
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-6 bg-muted/30 py-2">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border">
              <table className="min-w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-muted-foreground border-b last:border-b-0">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-border" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md my-6 border"
              loading="lazy"
            />
          ),
          video: ({ src, controls }) => (
            <div className="relative my-6">
              <video
                src={src}
                controls={controls}
                className="rounded-lg shadow-md w-full max-w-2xl"
              >
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            </div>
          ),
          details: ({ children }) => (
            <details className="my-4 rounded-lg border bg-muted/20">
              {children}
            </details>
          ),
          summary: ({ children }) => (
            <summary className="cursor-pointer px-4 py-3 font-semibold hover:bg-muted/30 transition-colors select-none">
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
