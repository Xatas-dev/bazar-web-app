import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/themeStore"

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Переключить тему</span>
    </Button>
  )
}

