import { create } from 'zustand'

interface SidebarState {
  leftCollapsed: boolean
  toggleLeftSidebar: () => void
}

// On tablet widths (md–lg) start with the icon rail so the content keeps enough room
const startCollapsed =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches

export const useSidebarStore = create<SidebarState>((set) => ({
  leftCollapsed: startCollapsed,
  toggleLeftSidebar: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
}))
