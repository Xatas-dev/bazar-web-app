# AGENTS.md — bazar-web-app

## Commands

```bash
npm run dev       # Vite dev server (proxies /api, /bazar-*, /ws, /oauth, /logout)
npm run build     # tsc && vite build
npm run lint      # ESLint — --max-warnings 0 (strict, zero warnings allowed)
npm run preview   # vite preview
```

Build order: lint → typecheck (part of build) → build. No test suite exists.

## Architecture

- **Entry:** `src/main.tsx` — initializes theme (before render to avoid flicker), mounts `<App />`
- **Routing:** `src/App.tsx` — React Router v6, nested: `RootLayout` (auth gate) → `GuestLayout` (unauthenticated) / `AppLayout` (authenticated)
- **Data layer:** TanStack React Query (`src/lib/react-query.ts`) — `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`
- **API clients:** `src/lib/axios.ts` — 6 axios instances (space/persona/chat/storage/auth/gateway). All auto-inject `Bearer` token from `localStorage.access_token` + CSRF (`XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header). 403s trigger a toast. Never create new clients.
- **Local state:** Zustand stores in `src/store/` — `userStore`, `themeStore` (persisted as `theme-storage`), `sidebarStore`
- **WebSocket:** `src/hooks/useChatWebSocket.ts` — STOMP over `/ws`, subscribes `/topic/chat/{chatId}`, mutates React Query cache on CREATED/DELETED/EDITED events. Dev-only: `window.simulateWSEvent()` + `window.__testQueryClient` for console testing.
- **Auth:** OAuth2/Keycloak via `/oauth2/authorization/keycloak` (local: `/oauth2/authorization/keycloak`). Logout POSTs to `/logout` (dev) or `/api/logout`.

## Cache key conventions

```ts
['spaces']                           // space list
['space-users', spaceId]             // users in a space
['user', 'iam']                      // current user profile
['roles', spaceId]                   // roles
['chat', chatId, 'messages']         // chat messages (infinite query, pages)
```

Prefer `setQueryData` for mutations, `invalidateQueries` only when necessary.

## UI & Styling

- **Read `DESIGN.md`** before any UI work — all colors, spacing, fonts, radii, shadows, blur must trace to tokens defined there.
- **shadcn/ui only.** Components in `src/components/ui/`. Add new ones via `npx shadcn@latest add [name]`.
- **No inline styles** (`style={{}}`), no raw Tailwind palette (`bg-blue-500`). Use semantic classes only: `bg-primary`, `text-foreground`, `border-border`, etc.
- **Dark mode** via `.dark` class on `<html>`. Verify every change in both themes.
- Use `@/` path alias; configured in `tsconfig.json` (`@/* → ./src/*`) and `vite.config.ts`.
- `tailwind.config.js` has `darkMode: ["class"]` and extends colors, border-radius, keyframes.

## Dev proxy (vite.config.ts)

In dev mode, these prefixes route to `VITE_API_TARGET` (default `http://localhost:8080`) except `/bazar-*` which route to `http://localhost:8080` (json-server):
- `/api` → `VITE_API_TARGET`
- `/bazar-space`, `/bazar-persona`, `/bazar-chat`, `/bazar-storage`, `/bazar-authorization` → `http://localhost:8080` (json-server mock)
- `/ws` → `VITE_API_TARGET` (WebSocket)
- `/logout`, `/oauth` → `VITE_API_TARGET`

Env: `VITE_API_GATEWAY_URL` and `VITE_KEYCLOAK_URL` in `.env.development`.

## Local full-stack dev

See `devSandbox/README.md` (Russian). Requires: `host.docker.internal` → `127.0.0.1`, copy space policy YAML, docker-compose up. Credentials: Keycloak admin `admin:admin`, default user `user:user`, rustFS `test:test123`. Storage tab needs manual rustFS bucket config.

## Notable

- `db.json` is empty — local mock data source for json-server (gitignored).
- `src/index.ts` is unused (single console.log).
- ESLint config is defined in `package.json` (`eslint . --report-unused-disable-directives`). No eslintrc file.
- Docker: multi-stage (`node:20-alpine` builder → `nginx:alpine`), uses `npm install` (not `ci`).
- CI pushes Docker images to Docker Hub on master push, tags with `bweb-<version>`.
- Jira release workflow: manually dispatched, tags `release-to-jira` action.
