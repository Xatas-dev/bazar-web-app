import { create } from 'zustand'
import { UserDtoResponse } from '@/types/api'

interface UserState {
  user: UserDtoResponse | null
  isLoading: boolean
  setUser: (user: UserDtoResponse | null) => void
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
