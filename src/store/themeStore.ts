import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme-storage'
const systemDarkQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

/** OS / browser preference, used until the user picks a theme explicitly */
function getSystemTheme(): Theme {
  return systemDarkQuery?.matches ? 'dark' : 'light'
}

/** The theme the user chose with the toggle, if any (persist only writes after a toggle) */
function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const theme = JSON.parse(stored)?.state?.theme
    return theme === 'dark' || theme === 'light' ? theme : null
  } catch {
    return null
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getStoredTheme() ?? getSystemTheme(),
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
      name: STORAGE_KEY,
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

// Инициализация темы при загрузке приложения (до рендера, чтобы избежать мигания).
// Без явного выбора пользователя тема следует системной настройке, в том числе при её смене.
export function initializeTheme() {
  applyTheme(getStoredTheme() ?? getSystemTheme())

  systemDarkQuery?.addEventListener('change', () => {
    if (getStoredTheme()) return
    const theme = getSystemTheme()
    useThemeStore.setState({ theme })
    // persist writes on every setState; drop it so a system switch isn't saved as the user's choice
    useThemeStore.persist.clearStorage()
    applyTheme(theme)
  })
}
