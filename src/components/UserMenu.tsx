import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download, LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleMenuItem } from "@/components/ThemeToggle";
import { useUser } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useLogout";
import { usePanel } from "@/hooks/usePanel";
import { useThemeStore } from "@/store/themeStore";
import { getInstallPlatform, usePwaInstallStore } from "@/lib/pwaInstall";

interface UserMenuProps {
  /** Element that opens the menu (rendered with `asChild`) */
  trigger: ReactNode;
  align?: "start" | "center" | "end";
  /** Replaces the default "go to /spaces" behaviour of the "Создать спейс" item */
  onCreateSpace?: () => void;
}

/** Profile, create space, theme and logout. Shared by the desktop sidebar and the mobile space list. */
export function UserMenu({ trigger, align = "start", onCreateSpace }: UserMenuProps) {
  const { user } = useUser();
  const { theme, toggleTheme } = useThemeStore();
  const logout = useLogout();
  const { open } = usePanel();
  const displayName = user?.displayName ?? undefined;
  const canInstall = usePwaInstallStore((s) => getInstallPlatform(s) !== "unsupported");
  const openInstallSheet = usePwaInstallStore((s) => s.setSheetOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-80 max-w-[calc(100vw-2rem)]">
        <DropdownMenuItem onSelect={() => open("profile")} className="h-auto gap-3 rounded-lg p-1.5 pr-3">
          <Avatar className="h-11 w-11 shrink-0">
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={displayName || "Аватар"} className="object-cover" />
            ) : null}
            <AvatarFallback>{displayName?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{displayName || "Пользователь"}</p>
            <p className="truncate text-xs text-muted-foreground">Открыть профиль</p>
          </div>
        </DropdownMenuItem>
        {onCreateSpace ? (
          <DropdownMenuItem onSelect={onCreateSpace} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать спейс
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/spaces" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Создать спейс
            </Link>
          </DropdownMenuItem>
        )}
        {canInstall ? (
          <DropdownMenuItem onSelect={() => openInstallSheet(true)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Установить приложение
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <ThemeToggleMenuItem theme={theme} onToggleTheme={toggleTheme} />
        <DropdownMenuItem
          onSelect={logout}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
