import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useThemeStore } from "@/store/themeStore";
import { LandingLogo } from "./LandingLogo";

interface LandingHeaderProps {
  loginUrl: string;
}

export function LandingHeader({ loginUrl }: LandingHeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const themeLabel = theme === "light" ? "Тёмная тема" : "Светлая тема";

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Frosted layer: invisible at the top of the page, fades in once the page scrolls */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="surface-panel-muted absolute inset-0 rounded-none border-x-0 border-t-0"
      />

      <motion.div
        initial={false}
        animate={{ height: scrolled ? 68 : 92 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a href="#top" aria-label="Bazar Space — в начало страницы">
          <motion.span
            className="block origin-left"
            initial={false}
            animate={{ scale: scrolled ? 0.9 : 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <LandingLogo size="lg" />
          </motion.span>
        </a>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={themeLabel}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </motion.span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{themeLabel}</TooltipContent>
          </Tooltip>
          <Button asChild className="group rounded-full px-5">
            <a href={loginUrl}>
              Войти
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
}
