import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Применяем тему при загрузке из localStorage
        if (state) {
          applyTheme(state.theme)
        }
      }
    }
  )
)

// Функция для применения темы к документу
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  syncThemeColor()
}

// Mobile browser chrome (status bar / address bar) follows the shell surface token
function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]')
  const shell = getComputedStyle(document.documentElement).getPropertyValue('--shell-surface').trim()
  if (meta && shell) {
    meta.setAttribute('content', `hsl(${shell})`)
  }
}

// Инициализация темы при загрузке приложения
export function initializeTheme() {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      applyTheme(state.theme)
    } catch {
      applyTheme('light')
    }
  }
}

