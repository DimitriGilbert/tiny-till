# AGENTS.md

This guide is for agentic coding assistants working in the tiny-till repository.

## Important Restrictions

### DO NOT
- **NEVER run the dev server** (do not use `npm run dev`, `npm run dev:web`, or any dev commands)
- **NEVER start background or long-running processes**
- **NEVER use `:any`, `as any`, or `any` as type** - this is a typesafe codebase, always use proper types
- **NEVER use `await import()` or dynamic imports** - EVER - NO EXCEPTIONS - DO NOT USE THEM AT ALL

### REQUIRED Before Claiming Success
- **MUST run** `npm run check-types` and ensure it succeeds
- **MUST run** `npm run build` and ensure it succeeds
- **MUST fix all LSP errors** when they occur

### Documentation Lookup
- Use **Context7 MCP** for up-to-date documentation when needed (training knowledge cutoff applies)
- Context7 provides current docs for all libraries/frameworks

## Project Context

This is a **static web application** that will be hosted on GitHub Pages. Focus on client-side functionality, SEO-friendly markup, and optimized bundle sizes.

### Project Structure

```
tiny-till/
├── apps/
│   └── web/           # Frontend React app
│       ├── src/
│       │   ├── components/   # React components
│       │   │   └── ui/       # shadcn/ui components
│       │   ├── routes/      # TanStack Router routes
│       │   ├── lib/         # Utilities (cn helper)
│       │   ├── main.tsx     # App entry point
│       │   └── index.css    # Global styles
│       └── vite.config.ts
├── packages/
│   ├── config/        # Shared TypeScript config
│   └── env/           # Environment variables (zod)
├── turbo.json         # Turborepo config
└── package.json       # Root workspace config
```

## Code Style Guidelines

### Coding Principles
- **Use shadcn/ui components** as much as possible before building custom components
- **Stay DRY** - prefer creating reusable custom components and utilities over repeating code
- **Use adapted skills when available** - frontend-design skill is MANDATORY when working on the frontend
- **Type safety is mandatory** - never use `any` type, always use proper TypeScript types
- **NO dynamic imports** - NEVER use `await import()` under ANY circumstances

### TypeScript Configuration
- Strict mode enabled: `strict: true`
- Target: ESNext
- Module: ESNext
- Resolution: bundler
- Verbatim module syntax enabled (use explicit type imports)
- Additional strict flags: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`

### Import Style
- Use named imports: `import { Button } from "@/components/ui/button"`
- Use type-only imports for types: `import type { ClassValue } from "clsx"`
- Local imports grouped at top, external libraries first
- Use `@/` alias for src directory imports: `import { cn } from "@/lib/utils"`
- **ALL imports must be static** - NEVER use `await import()` or dynamic imports

### Component Conventions
- Named exports preferred: `export function ComponentName() { ... }`
- Default exports acceptable for simple components: `export default function Loader()`
- shadcn/ui components export both component and variants: `export { Button, buttonVariants }`
- Props destructured with rest pattern: `function Component({ className, ...props })`
- Component names PascalCase, file names PascalCase (Button.tsx) or kebab-case (mode-toggle.tsx)

### React Patterns
- Use function components exclusively
- Leverage shadcn/ui and Base UI primitives
- Use class-variance-authority (cva) for component variants
- Combine classes with cn() utility: `className={cn("base-class", className)}`
- Use TanStack Router Link for navigation: `<Link to="/">Home</Link>`
- Route components export `Route` constant from `createFileRoute` or `createRootRouteWithContext`

### Styling
- Tailwind CSS v4 with Vite plugin
- Use semantic class names, avoid arbitrary values where possible
- Dark mode support via `next-themes`
- Responsive utilities with mobile-first approach
- Spacing, colors, and typography from Tailwind default scale

### Type Definitions
- Interfaces for complex shapes, types for simple unions/aliases
- Context types defined in root route: `export interface RouterAppContext {}`
- Component props typed inline with interfaces or type from libraries
- Use generic types from libraries: `VariantProps<typeof buttonVariants>`

### Error Handling
- Throw descriptive Error objects: `throw new Error("Root element not found")`
- Use type guards and runtime checks where needed
- Environment variables validated with zod

### File Naming
- Components: PascalCase (Button.tsx) or kebab-case (mode-toggle.tsx)
- Utilities: camelCase (utils.ts)
- Routes: file-based naming from TanStack Router (index.tsx, __root.tsx)
- Types: Same as file they define

### Formatting
- 2 space indentation
- Trailing commas in multi-line arrays/objects
- No semicolons preferred (check existing patterns in file)
- Consistent spacing around operators and after keywords
- No comments in production code unless necessary

## Technology Stack

- **React 19** - UI library
- **TanStack Router** - File-based routing with type safety
- **Tailwind CSS v4** - Styling with Vite plugin
- **shadcn/ui** - Reusable component primitives
- **Base UI** - Headless React components (@base-ui/react)
- **TypeScript 5** - Type safety
- **Turborepo** - Monorepo build system
- **Vite** - Build tool and dev server
- **zod** - Runtime validation
- **lucide-react** - Icon library

## Key Patterns

### Creating New Routes
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path")({
  component: PageComponent,
});

function PageComponent() {
  return <div>Page content</div>;
}
```

### Creating UI Components
```typescript
import { cn } from "@/lib/utils";

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {/* content */}
    </div>
  );
}
```

### Environment Variables
- Define in `packages/env/src/web.ts` using zod
- Import: `import { env } from "@tiny-till/env/web"`
