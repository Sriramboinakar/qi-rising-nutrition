<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend & UI Guidelines

- **Prefer shadcn/ui components.** Before creating any custom UI component, check whether shadcn already provides a suitable one (`use shadcn` tools / registry) and reuse it. Only build custom when shadcn genuinely doesn't fit.
- **Animations**: use `motion` (Motion for React) for subtle animations only — page entrances, scroll reveals, hover/micro-interactions, staggered lists. Respect `prefers-reduced-motion`. Avoid GSAP/Three.js/Lenis unless the feature genuinely requires it.
- **Quality bar**: premium visual hierarchy, strong typography, clean spacing, mobile-first responsive layouts, accessibility (semantic HTML, keyboard + screen-reader support), and performance (minimal client JS, lazy loading, Next.js image handling).
- **Keep it restrained**: no excessive gradients, glassmorphism, shadows, or constant motion. Animations support the design, never distract from it.
