# bazar-web-app — Claude instructions

Frontend for the Bazar system. React 19 + Vite + TypeScript, Tailwind 3 + shadcn/ui, TanStack Query, Zustand.

The project docs below are the source of truth. They load into every session:

@ai/AGENTS.md
@ai/DESIGN.md

## Hard rules (always)

1. **Tokens only.** Every color, radius, spacing, blur and gradient comes from `src/styles/tokens.css` / `ai/DESIGN.md`. Use semantic classes (`bg-primary`, `text-muted-foreground`, `border-border`). For tokens that are not in `tailwind.config.js`, use arbitrary values such as `bg-[hsl(var(--self-block))]`. Never use raw palette classes (`bg-blue-500`) or hex values.
2. **Surfaces through classes.** Use `surface-shell`, `surface-panel`, `surface-panel-muted`, `surface-panel-strong` and `surface-overlay` from `src/styles/global.css`. No `shadow-*` and no `backdrop-blur-*` / ad-hoc `backdrop-filter`.
3. **No inline `style={{}}`.** Use `max-w-[var(--right-sidebar-width)]` and similar instead.
4. **shadcn/ui first.** Reuse `src/components/ui/*`. Add new components via `npx shadcn@latest add <name>`, then restyle them onto the surface classes.
5. **UI copy in Russian**, including `aria-label`, toasts and placeholders.
6. **Both themes.** Every change must look right in light mode and in `.dark` mode.
7. **Zero lint warnings.** `npm run lint` and `npm run build` must pass before calling work done.

For any UI, component, styling, page or feature work, load the **`bazar-ui`** skill (`.claude/skills/bazar-ui/SKILL.md`). It has the full token map, surface guide, component inventory and code patterns.
