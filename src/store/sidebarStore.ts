import { create } from 'zustand'

interface SidebarState {
  active: string | null
  setActive: (name: string | null) => void
  leftCollapsed: boolean
  toggleLeftSidebar: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  active: null,
  setActive: (name) => set({ active: name }),
  leftCollapsed: false,
  toggleLeftSidebar: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
}))
