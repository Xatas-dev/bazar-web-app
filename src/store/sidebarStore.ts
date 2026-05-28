import { create } from 'zustand'

interface SidebarState {
  active: string | null
  setActive: (name: string | null) => void
  panel: string | null
  setPanel: (name: string | null, meta?: Record<string, unknown>) => void
  panelMeta: Record<string, unknown>
  leftCollapsed: boolean
  toggleLeftSidebar: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  active: null,
  setActive: (name) => set({ active: name, panel: null, panelMeta: {} }),
  panel: null,
  setPanel: (name, meta) => set({ panel: name, panelMeta: meta ?? {} }),
  panelMeta: {},
  leftCollapsed: false,
  toggleLeftSidebar: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
}))
