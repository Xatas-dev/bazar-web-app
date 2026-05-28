import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
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
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.div>
      <span className="sr-only">Переключить тему</span>
    </Button>
  )
}

