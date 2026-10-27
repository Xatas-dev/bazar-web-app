import { create } from 'zustand'
import { UserDtoResponseV2 } from '@/types/api'

interface UserState {
  user: UserDtoResponseV2 | null
  isLoading: boolean
  setUser: (user: UserDtoResponseV2 | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null })
}))
