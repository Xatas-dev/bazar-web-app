import { useMemo, useState } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useSpaces } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Box,
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


type SidebarTopBarProps = {
  userName?: string;
  userPic?: string;
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
  userName,
  userPic,
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
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open user menu">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuItem onSelect={onOpenProfile} className="h-auto gap-3 px-2 py-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userPic || ""} />
                <AvatarFallback>{userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName || "User"}</p>
                <p className="truncate text-xs text-muted-foreground">Open profile</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/spaces" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create space
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ThemeToggleMenuItem theme={theme} onToggleTheme={onToggleTheme} />
            <DropdownMenuItem
              onSelect={onLogout}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
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
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open user menu">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuItem onSelect={onOpenProfile} className="h-auto gap-3 px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userPic || ""} />
              <AvatarFallback>{userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">Open profile</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/spaces" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create space
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ThemeToggleMenuItem theme={theme} onToggleTheme={onToggleTheme} />
          <DropdownMenuItem
            onSelect={onLogout}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={spaceSearch}
          onChange={(event) => onSpaceSearchChange(event.target.value)}
          placeholder="Search spaces"
          aria-label="Search spaces"
          className="pl-9"
        />
      </div>

      {onToggleCollapse && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 ml-auto"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

type NavigationContentProps = {
  spaces: Array<{ id: number; name: string }>;
  spaceSearch: string;
  onSpaceClick: () => void;
  isMobile?: boolean;
};

function NavigationContent({
  spaces,
  spaceSearch,
  onSpaceClick,
  isMobile = false,
}: NavigationContentProps) {
  return (
    <ScrollArea className="flex-1 py-4">
      <div className="px-4 space-y-4">
        <nav className="space-y-1">
          <h3 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
            My Spaces
          </h3>
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
                    "flex-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "bg-transparent"
                  )
                }
              >
                <Box className="mr-2 h-4 w-4" />
                <span className="truncate">{space.name}</span>
              </NavLink>
            </motion.div>
          ))}
          {spaceSearch.trim() && spaces.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">No spaces found.</p>
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
  const spaces = spacesData?.spaces || [];

  const filteredSpaces = useMemo(() => {
    const query = spaceSearch.trim().toLowerCase();
    if (!query) {
      return spaces;
    }

    return spaces.filter((space) => space.name.toLowerCase().includes(query));
  }, [spaceSearch, spaces]);

  const handleLogout = async () => {
    try {
      const logoutUrl = process.env.NODE_ENV === "development" ? "/logout" : "/api/logout";
      await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        redirect: "follow",
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/";
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-clip bg-transparent">
      <motion.aside
        initial={false}
        animate={{ width: leftCollapsed ? "3.25rem" : "20rem" }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="surface-shell hidden h-full shrink-0 flex-col border-r border-border overflow-hidden md:flex"
      >
        <SidebarTopBar
          userName={user?.userName ?? undefined}
          userPic={user?.userPic ?? undefined}
          spaceSearch={spaceSearch}
          onSpaceSearchChange={setSpaceSearch}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          collapsed={leftCollapsed}
          onToggleCollapse={toggleLeftSidebar}
        />
        {!leftCollapsed && (
          <NavigationContent
            spaces={filteredSpaces}
            spaceSearch={spaceSearch}
            onSpaceClick={handleNavClick}
          />
        )}
      </motion.aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-clip">
        <header className="surface-shell flex h-16 items-center border-b border-border px-4 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="surface-panel-strong flex w-72 flex-col p-0">
              <SidebarTopBar
                userName={user?.userName ?? undefined}
                userPic={user?.userPic ?? undefined}
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
