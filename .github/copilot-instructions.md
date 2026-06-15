# Copilot Instructions — bazar-web-app

---

## Build, Run, Lint

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # tsc + vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

## High-Level Architecture

    Entry + routing: src/main.tsx initializes the theme and renders <App />. Routes are defined in src/App.tsx using React Router with RootLayout (auth gating), GuestLayout, and AppLayout. Protected routes live under AppLayout.

    Data layer: React Query is the primary data/cache layer. The shared client is configured in src/lib/react-query.ts and provided in App.tsx. Feature hooks live in src/hooks/* and encapsulate API calls + cache updates.

    API clients: src/lib/axios.ts defines axios instances per backend (space/persona/chat/storage/auth/gateway). They share auth header injection from localStorage and CSRF cookie/header defaults. Base URLs come from src/config.ts, which switches between baseUrl and targetLocal depending on NODE_ENV.

    Proxy + env: vite.config.ts proxies /api, /bazar-*, /ws, /logout, /oauth to VITE_API_TARGET (defaults to http://localhost:8080) and uses local mock targets in development.

    WebSockets: src/hooks/useChatWebSocket.ts uses STOMP over /ws and mutates React Query cache for chat events. In development it exposes window.simulateWSEvent(...) and window.__testQueryClient for console-driven testing.

    State + theming: Zustand stores in src/store/*. Theme is persisted in themeStore and toggled by applying the dark class; initializeTheme() runs before render to avoid flicker. Tailwind is configured for class-based dark mode.

## Key Conventions

    Use the @/ path alias for src/ imports (configured in tsconfig.json and Vite).
    Prefer React Query hooks in src/hooks/ and keep cache keys consistent (e.g. ['spaces'], ['space-users', spaceId]); update cache via setQueryData or invalidateQueries.
    Use the axios instances from src/lib/axios.ts — never create new clients. They already handle auth headers and CSRF.
    Chat-related real-time updates must go through useChatWebSocket to keep cache updates consistent.
    For local full-stack dev, follow devSandbox/README.md: update host.docker.internal mapping, copy space-policy.yaml, run docker-compose, and configure RustFS bucket/webhook for the Storage tab. Default local creds are listed there.

## Design System & UI Rules
### Design Tokens

Read DESIGN.md in the project root before generating, modifying, or styling any UI element. Every visual decision — color, spacing, font, radius, shadow, glass effect, animation, dark/light variant — must trace back to a token defined in that file. No exceptions.

Read DESIGN.md every time you:

    Create or modify a page, layout, route, or component
    Touch any visual property (color, spacing, font, radius, shadow, blur)
    Implement or adjust dark/light mode
    Add any animation or transition

### Design Skill

You have the Glassmorphism design system skill loaded. Apply it to all UI work. Follow its component anatomy rules, interaction state definitions, accessibility gates, and QA checklist whenever you create or modify a component.
Hard Rules

    shadcn/ui only. All UI components must come from src/components/ui/. Never use any other component library. If a needed component is missing, install it: npx shadcn@latest add [component-name].
    No hardcoded visual values. Every color, spacing, font, radius, and shadow must reference a semantic token from DESIGN.md.
    No inline styles. Use Tailwind utility classes only. Never style={{}}.
    No raw Tailwind palette colors. Use semantic classes (bg-primary, text-foreground, border-border) — never raw classes like bg-blue-500.
    Both themes. Verify every UI change works in both dark and light mode before considering it done.
