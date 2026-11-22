---
name: bazar-ui
description: Design system and frontend conventions for bazar-web-app (ShellPanel tokens, surface-* classes, shadcn/ui customizations, React Query hook patterns, Russian UI copy). Use for ANY task in this repo that touches UI, components, pages, layouts, styling, Tailwind classes, themes/dark mode, skeletons, sidebars/drawers/dialogs, or new features with data fetching.
---

# Bazar UI: design system & practices

The spec is `ai/DESIGN.md` (the "ShellPanel" system) and `ai/AGENTS.md`. This skill describes how those ideas are **actually implemented in code**. Follow the code reality described here.

## 1. Where the design system lives

| What | File |
|---|---|
| CSS variables (light `:root` + `.dark`), HSL triplets | `src/styles/tokens.css` |
| Surface classes, body gradient, scrollbars, fade masks | `src/styles/global.css` |
| Tailwind color/radius/animation mapping | `tailwind.config.js` |
| shadcn components (already restyled) | `src/components/ui/*` |
| `cn()`, `formatBytes`, `formatDate`, `getInitials` | `src/lib/utils.ts` |

### Tokens → Tailwind
- **Mapped in Tailwind** (use directly): `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info` (each with `-foreground`), `border`, `input`, `ring`. Examples: `bg-primary text-primary-foreground`, `text-muted-foreground`, `border-border`, `bg-success/10 text-success`.
- **Not mapped**, so use arbitrary values:
  - Own messages and files: `bg-[hsl(var(--self-block))]`, `text-[hsl(var(--self-block-foreground))]`, `border-[hsl(var(--self-block-border))]`
  - Shell: `--shell-surface`, `--shell-border`
  - Panel: `--panel-surface`, `--panel-surface-muted`, `--panel-surface-strong`, `--panel-border`, `--panel-border-strong`, `--panel-overlay`
  - Layout: `max-w-[var(--right-sidebar-width)]` (40rem), `w-[var(--left-sidebar-width)]` (20rem)
  - Large avatar corners: `rounded-[var(--space-avatar-radius)]` (14%, proportional so the shape holds at any size)
  - Disabled state: `--panel-disabled-opacity` (0.5)
- **Radius:** `rounded-lg` = `var(--radius)` (1.375rem), `rounded-md` (−2px), `rounded-sm` (−4px), `rounded-full` for pills and avatars.
- **Danger = `destructive`** in code (DESIGN.md calls it `danger`). Toast/button variant is `"destructive"`.
- **Spacing:** the Tailwind scale matching DESIGN.md: xs `1` (4px), sm `2`, md `4`, lg `6`, xl `8`, 2xl `10`.
- **Gradients:** only the global `--app-gradient` on `body`. Never add ad-hoc gradients. Add a token first if one is truly needed.
- **Fonts:** DESIGN.md specifies Plus Jakarta Sans / JetBrains Mono, but they are not wired up yet. Don't hard-code font families in components.

## 2. Surface decision guide

| Element | Class | Notes |
|---|---|---|
| Persistent chrome: sidebars, headers, rails, right drawers | `surface-shell` | Opaque, **no blur**. Usually with `border-l`/`border-r` |
| Content cards / blocks | `surface-panel` | Opaque card + border (`ui/card` uses it) |
| Inputs, textareas, menus, tooltips, small controls | `surface-panel-muted` | Frosted (strong backdrop via `::before`) |
| Dialogs, sheets, drawers-as-modals, popovers | `surface-panel-strong` | Frosted, stronger border, no shadow |
| Modal backdrop | `surface-overlay` | |

Rules: **elevation is flat**. Use no `shadow-*` (write `shadow-none` if a shadcn default adds one) and no `backdrop-blur-*` (blur comes only from the surface classes; `backdrop-blur-none` to cancel is fine). Separate layers with surface contrast and borders.

List fades: `.message-fade-mask` (chat list), `.storage-fade-mask`.

## 3. Component inventory (`src/components/ui`)
avatar, badge, button, card, checkbox, context-menu, dialog, dropdown-menu, input, label, popover, radio-group, scroll-area, separator, sheet, skeleton, tabs, textarea, toast, toaster, tooltip.

Customizations to keep consistent:
- `button`: shadcn variants plus `transition-all active:scale-[0.97]`.
- `card`: `surface-panel rounded-lg`.
- `skeleton`: `variant="fade" | "shimmer" | "pulse"` (default `fade`), supports `asChild`.
- `input`, `textarea`, `tooltip`, `context-menu`, `dropdown-menu`: `surface-panel-muted`.
- `dialog`, `sheet`: `surface-panel-strong` plus a `surface-overlay` backdrop.
- `tabs`: pill style (`rounded-full`); the active tab gets `bg-[hsl(var(--panel-surface-strong))]`.
- Missing component? Run `npx shadcn@latest add <name>`, then replace its bg/shadow with the matching surface class above and strip `shadow-*`.

Icons: `lucide-react`, default `h-4 w-4`. Icon-only buttons get a Russian `aria-label` and are usually wrapped in a `Tooltip`.

## 3a. Avatars

- **Display:** `SpaceAvatar` (`src/components/spaces/SpaceAvatar.tsx`) for spaces, and also for any big editable avatar. `shape="round"` (default) for lists and headers, `shape="squircle"` for the large settings/profile avatar. Initials fallback on `bg-primary`. User avatars elsewhere use `ui/avatar` with `AvatarImage className="object-cover"` + `AvatarFallback`.
- **Sizes:** sidebar rows and collapsed rail 52px (`h-[3.25rem]`), space header / member cards / user menu 44px (`h-11`, `h-10` on mobile header), editor = half the panel width (`w-1/2 aspect-square`).
- **Glow:** only on the large editor avatar (`glow` prop on `SpaceAvatar`: a blurred copy behind it). This filter `blur-*` is the single allowed exception to "no blur"; don't add glows to lists, headers or cards (tried and removed).
- **Editing:** reuse `AvatarEditor` (`src/components/AvatarEditor.tsx`) — pencil button → file pick → inline `AvatarCropper` (react-easy-crop, square, drag + zoom) replaces the avatar → `cropAvatarImage` (`src/lib/avatar-image.ts`) makes ≤512×512 WebP (PNG fallback) → `upload(file)`. Wrappers: `spaces/SpaceAvatarEditor.tsx`, and `ProfileRail` passes `useUpdateAvatar`. No dialogs for cropping.
- **Upload flow (hooks):** POST metadata → PUT file to the pre-signed `uploadUrl` with `fetch` → poll until ready (`useUploadSpaceAvatar` in `useSpaces.ts`, `useUpdateAvatar` in `useUser.ts`). Throw `AvatarUploadError` (`src/lib/avatar-upload.ts`) with a Russian message for non-HTTP failures.
- **Errors:** toasts via `notify.error.generic`, never inline text under the avatar. Skip the toast for axios errors (`isAxiosError`) — the interceptor already showed one.
- **Settings-style panels** (space Обзор tab, profile panel): big avatar centred with `pt-16` so the glow isn't clipped by the scroll area, then a label-less input (placeholder + `aria-label`) with an icon save button on the right; secondary/cancel actions use `variant="outline"`.

## 4. Code structure & patterns

```
src/
  components/<feature>/   chat, members, role, spaces, storage (PascalCase .tsx)
  components/ui/          shadcn (kebab-case)
  pages/                  XxxPage.tsx (+ XxxPageSkeleton.tsx), export default
  layouts/                RootLayout (auth gate) → GuestLayout / AppLayout
  hooks/                  useXxx.ts: API fetchers + React Query hooks
  lib/                    axios.ts, react-query.ts, notifications.ts, permissions.ts, utils.ts …
  store/                  Zustand: sidebarStore, themeStore (persisted), userStore
  types/                  api.ts, chat.ts, space.ts, storage.ts, push.ts
  styles/                 tokens.css, global.css
```

- **Imports:** use the `@/` alias, with relative imports only for siblings in the same folder.
- **Data fetching:** there is no separate api layer. In `hooks/useXxx.ts`, write private `async` fetchers with one of the shared instances from `@/lib/axios` (`axiosInstance`, `personaAxiosInstance`, `chatAxiosInstance`, `storageAxiosInstance`, `authorizationAxiosInstance`), then export `useGetX` / `useCreateX` / `useUpdateX` / `useDeleteX`. **Never create new axios clients.** Reference: `src/hooks/useRoles.ts`.
- **Cache keys:** arrays like `['spaces']`, `['space-users', spaceId]`, `['roles', spaceId]`, `['role', spaceId, roleId]`, `['chat', chatId, 'messages']`. Prefer `setQueryData` in mutations; use `invalidateQueries` only when needed.
- **Types:** API shapes go in `src/types/*.ts` as `export interface` with a `Dto` / `Request` / `Response` suffix. Component props interfaces live in the component file. Avoid `any`.
- **Notifications:** use `notify` from `@/lib/notifications` (Russian presets) or `toast` from `@/hooks/use-toast`. HTTP 403/401/5xx toasts already fire in the axios interceptors, so don't duplicate them.
- **Loading:** each loadable view has a sibling `XxxSkeleton.tsx` built from `ui/skeleton` that mirrors the real layout, returned while `isLoading`.
- **Forms:** no form library. Use controlled state inside a `useXxxForm` hook returning `formData`, `handleChange`, `handleSubmit`, `isPending`. See `src/hooks/useProfileForm.ts`.
- **Right sidebar / drawers:** `useSidebarStore` (`active`, `setActive(name|null)`, `leftCollapsed`, `toggleLeftSidebar`). Panels are `motion.aside` with `surface-shell border-l max-w-[var(--right-sidebar-width)]` inside `<AnimatePresence mode="wait">`, animating `width`/`opacity` with `{ duration: 0.18, ease: "easeOut" }`. See `src/components/ProfileRail.tsx` and `src/components/spaces/SpaceSettingsDrawer.tsx`.
- **Motion:** `framer-motion` for enter/exit and layout transitions. Keep it short (≈0.15–0.25s, easeOut). Tailwind keyframes already exist for skeletons and reactions (`skeleton-shimmer`, `skeleton-fade`, `reaction-*`).
- **Class merging:** always `cn()` when combining conditional classes or accepting `className`.
- **Dark mode:** the `.dark` class on `<html>` (managed by `themeStore`). Only use tokens and the rest follows. Check both themes.
- **Copy:** Russian for all user-facing text.

## 5. Known drift: don't copy these
These exist in the codebase but break the rules. Don't replicate them; fix them only if asked or if you're already touching the file.
- `shadow-sm` in `ProfileAvatar.tsx` (only used by `ProfilePage`), `shadow-md` in `ui/popover.tsx`.
- Arbitrary font sizes `text-[10px]` / `text-[11px]`. Prefer `text-xs`.
- `any` types in `useRoles.ts`. The English-only `formatDate` in `lib/utils.ts`.
- `npm run lint` currently fails for the whole repo: there is no ESLint config file. Until one is added, lint changed files with a temporary flat config (typescript-eslint recommended + react-hooks) and say so.
- Mutations that only `invalidateQueries` where `setQueryData` would work.

## 6. Done checklist for UI work
- [ ] Colors, radii, spacing and blur come only from tokens/surface classes; no hex, raw palette, `shadow-*`, `backdrop-blur-*` or inline style
- [ ] Correct surface class per section 2
- [ ] Reused `components/ui`; new shadcn pieces restyled
- [ ] Russian copy, including `aria-label`
- [ ] Skeleton for loading states
- [ ] Looks right in light **and** dark
- [ ] `npm run lint` (0 warnings) and `npm run build` pass
