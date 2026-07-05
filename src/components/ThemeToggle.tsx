import { Moon, Sun } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ThemeToggleMenuItemProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function ThemeToggleMenuItem({ theme, onToggleTheme }: ThemeToggleMenuItemProps) {
  return (
    <DropdownMenuItem onSelect={onToggleTheme} className="flex items-center gap-2">
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {theme === "light" ? "Dark theme" : "Light theme"}
    </DropdownMenuItem>
  );
}
