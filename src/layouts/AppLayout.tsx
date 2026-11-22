import { useEffect, useState, useMemo } from "react";
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSpaces } from "@/hooks/useSpaces";
import { useGetChatById } from "@/hooks/useChat";
import { pushService } from "@/services/pushService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LogOut,
  Menu,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useThemeStore } from "@/store/themeStore";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { ProfileRail } from "@/components/ProfileRail";
import { ThemeToggleMenuItem } from "@/components/ThemeToggle";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GetSpaceDto } from "@/types/space";


type UserMenuProfileItemProps = {
  displayName?: string;
  avatarUrl?: string;
  onOpenProfile: () => void;
};

function UserMenuProfileItem({ displayName, avatarUrl, onOpenProfile }: UserMenuProfileItemProps) {
  return (
    <DropdownMenuItem
      onSelect={onOpenProfile}
      className="h-auto gap-3 rounded-lg p-1.5 pr-3"
    >
      <Avatar className="h-11 w-11 shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName || "Аватар"} className="object-cover" />
        ) : null}
        <AvatarFallback>{displayName?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-base font-medium">{displayName || "Пользователь"}</p>
        <p className="truncate text-xs text-muted-foreground">Открыть профиль</p>
      </div>
    </DropdownMenuItem>
  );
}

type SidebarTopBarProps = {
  displayName?: string;
  avatarUrl?: string;
  spaceSearch: string;
  onSpaceSearchChange: (value: string) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

function SidebarTopBar({
  displayName,
  avatarUrl,
  spaceSearch,
  onSpaceSearchChange,
  onOpenProfile,
  onLogout,
  theme,
  onToggleTheme,
  collapsed,
  onToggleCollapse,
}: SidebarTopBarProps) {
  if (collapsed) {
    return (
      <div className="surface-shell flex flex-col items-center gap-2 px-1 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Открыть меню пользователя">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <UserMenuProfileItem displayName={displayName} avatarUrl={avatarUrl} onOpenProfile={onOpenProfile} />
            <DropdownMenuItem asChild>
              <Link to="/spaces" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать спейс
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ThemeToggleMenuItem theme={theme} onToggleTheme={onToggleTheme} />
            <DropdownMenuItem
              onSelect={onLogout}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onToggleCollapse}
            aria-label="Развернуть боковую панель"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="surface-shell flex items-center gap-3 px-3 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Открыть меню пользователя">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <UserMenuProfileItem displayName={displayName} avatarUrl={avatarUrl} onOpenProfile={onOpenProfile} />
          <DropdownMenuItem asChild>
            <Link to="/spaces" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Создать спейс
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ThemeToggleMenuItem theme={theme} onToggleTheme={onToggleTheme} />
          <DropdownMenuItem
            onSelect={onLogout}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={spaceSearch}
          onChange={(event) => onSpaceSearchChange(event.target.value)}
          placeholder="Поиск спейса"
          aria-label="Поиск спейса"
          className="pl-9"
        />
      </div>

      {onToggleCollapse && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 ml-auto"
          onClick={onToggleCollapse}
          aria-label="Свернуть боковую панель"
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

type NavigationContentProps = {
  spaces: GetSpaceDto[];
  spaceSearch: string;
  onSpaceClick: () => void;
  isMobile?: boolean;
  /** Icon-only rail: avatars stay clickable, names move into tooltips */
  collapsed?: boolean;
};

function NavigationContent({
  spaces,
  spaceSearch,
  onSpaceClick,
  isMobile = false,
  collapsed = false,
}: NavigationContentProps) {
  if (collapsed) {
    return (
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col items-center gap-1.5 px-2" aria-label="Спейсы">
          {spaces.map((space) => (
            <Tooltip key={space.id}>
              <TooltipTrigger asChild>
                <NavLink
                  to={`/spaces/${space.id}`}
                  aria-label={space.name}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "bg-accent" : "bg-transparent"
                    )
                  }
                >
                  <SpaceAvatar
                    name={space.name}
                    avatarUrl={space.avatarUrl}
                    className="h-[3.25rem] w-[3.25rem]"
                    fallbackClassName="text-sm"
                  />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{space.name}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 py-4">
      <div className="px-4 space-y-4">
        <nav className="space-y-1">
          {spaces.map((space) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex items-center"
            >
              <NavLink
                to={`/spaces/${space.id}`}
                onClick={isMobile ? onSpaceClick : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "bg-transparent"
                  )
                }
              >
                <SpaceAvatar
                  name={space.name}
                  avatarUrl={space.avatarUrl}
                  className="h-[3.25rem] w-[3.25rem] shrink-0"
                  fallbackClassName="text-sm"
                />
                <span className="truncate">{space.name}</span>
              </NavLink>
            </motion.div>
          ))}
          {spaceSearch.trim() && spaces.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">Спейсы не найдены.</p>
          ) : null}
        </nav>
      </div>
    </ScrollArea>
  );
}

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState("");
  const setActive = useSidebarStore((s) => s.setActive);
  const leftCollapsed = useSidebarStore((s) => s.leftCollapsed);
  const toggleLeftSidebar = useSidebarStore((s) => s.toggleLeftSidebar);
  const setProfileOpen = (val: boolean) => setActive(val ? 'profile' : null);
  const location = useLocation();
  const isSpaceRoute = location.pathname.startsWith('/spaces/');
  const isSpaceDetailRoute = /^\/spaces\/\d+/.test(location.pathname);
  const contentKey = isSpaceDetailRoute ? 'space-detail' : location.pathname;
   const { user } = useUser();
   const { theme, toggleTheme } = useThemeStore();
   const { data: spacesData } = useSpaces();
   const spaces = useMemo(() => spacesData?.spaces ?? [], [spacesData]);
   const navigate = useNavigate();

   const searchParams = new URLSearchParams(location.search);
  const notificationChatIdParam = searchParams.get("chatId");
  const notificationMessageIdParam = searchParams.get("messageId");
  const notificationChatId = notificationChatIdParam ? Number(notificationChatIdParam) : undefined;
  const { data: notificationChat, error: notificationChatError } = useGetChatById(notificationChatId);

  useEffect(() => {
    if (notificationChatError) {
      console.error("[WebPush] Failed to resolve chat route from notification", notificationChatError);
    }
  }, [notificationChatError]);

  useEffect(() => {
    if (!notificationChat || !notificationChatIdParam) {
      return;
    }

    const targetSearchParams = new URLSearchParams();
    targetSearchParams.set("chatId", notificationChatIdParam);
    if (notificationMessageIdParam) {
      targetSearchParams.set("messageId", notificationMessageIdParam);
    }
    targetSearchParams.set("tab", "chat");

    const targetPath = `/spaces/${notificationChat.spaceId}`;
    const targetUrl = `${targetPath}?${targetSearchParams.toString()}`;

    if (`${location.pathname}${location.search}` !== targetUrl) {
      navigate(targetUrl, { replace: true });
    }
  }, [location.pathname, location.search, navigate, notificationChat, notificationChatIdParam, notificationMessageIdParam]);

  const filteredSpaces = useMemo(() => {
    const query = spaceSearch.trim().toLowerCase();
    if (!query) {
      return spaces;
    }

    return spaces.filter((space) => space.name.toLowerCase().includes(query));
  }, [spaceSearch, spaces]);

   const handleLogout = async () => {
     try {
       await pushService.unsubscribe();

       const logoutUrl = process.env.NODE_ENV === "development" ? "/logout" : "/api/logout";
       await fetch(logoutUrl, {
         method: "POST",
         credentials: "include",
         redirect: "follow",
       });

       window.location.href = "/";
     } catch (error) {
       console.error("Выход не удался", error);
       window.location.href = "/";
     }
   };

   // Закрывать меню при переходе на другую страницу
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-clip bg-transparent">
      <motion.aside
        initial={false}
        animate={{ width: leftCollapsed ? "5rem" : "20rem" }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="surface-shell hidden h-full shrink-0 flex-col border-r border-border overflow-hidden md:flex"
      >
        <SidebarTopBar
          displayName={user?.displayName ?? undefined}
          avatarUrl={user?.avatarUrl ?? undefined}
          spaceSearch={spaceSearch}
          onSpaceSearchChange={setSpaceSearch}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          collapsed={leftCollapsed}
          onToggleCollapse={toggleLeftSidebar}
        />
        <NavigationContent
          // Search input is hidden while collapsed, so show every space there
          spaces={leftCollapsed ? spaces : filteredSpaces}
          spaceSearch={leftCollapsed ? "" : spaceSearch}
          onSpaceClick={handleNavClick}
          collapsed={leftCollapsed}
        />
      </motion.aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-clip">
        <header className="surface-shell flex h-16 items-center border-b border-border px-4 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Открыть меню">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="surface-panel-strong flex w-72 flex-col p-0">
              <SidebarTopBar
                displayName={user?.displayName ?? undefined}
                avatarUrl={user?.avatarUrl ?? undefined}
                spaceSearch={spaceSearch}
                onSpaceSearchChange={setSpaceSearch}
                onOpenProfile={() => setProfileOpen(true)}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
              <NavigationContent
                spaces={filteredSpaces}
                spaceSearch={spaceSearch}
                onSpaceClick={handleNavClick}
                isMobile
              />
            </SheetContent>
          </Sheet>
        </header>

        <main className="min-h-0 flex-1 overflow-clip bg-transparent">
          <AnimatePresence mode="sync">
            <motion.div
              key={contentKey}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isSpaceRoute ? <ProfileRail /> : null}
    </div>
  );
};
