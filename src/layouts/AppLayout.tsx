import { useEffect, useState, useMemo } from "react";
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSpaces } from "@/hooks/useSpaces";
import { useGetChatById } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BREAKPOINTS, useMediaQuery } from "@/hooks/useMediaQuery";
import { useAppViewportHeight } from "@/hooks/useAppViewportHeight";
import { ArrowLeft, Menu, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { ProfileRail } from "@/components/ProfileRail";
import { UserMenu } from "@/components/UserMenu";
import { InstallAppSheet } from "@/components/InstallAppSheet";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GetSpaceDto } from "@/types/space";

type SidebarTopBarProps = {
  spaceSearch: string;
  onSpaceSearchChange: (value: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const userMenuTrigger = (
  <Button variant="ghost" size="icon" className="shrink-0" aria-label="Открыть меню пользователя">
    <Menu className="h-5 w-5" />
  </Button>
);

function SidebarTopBar({ spaceSearch, onSpaceSearchChange, collapsed, onToggleCollapse }: SidebarTopBarProps) {
  if (collapsed) {
    return (
      <div className="surface-shell flex flex-col items-center gap-2 px-1 py-2.5">
        <UserMenu trigger={userMenuTrigger} />
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
      <UserMenu trigger={userMenuTrigger} />

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
  /** Icon-only rail: avatars stay clickable, names move into tooltips */
  collapsed?: boolean;
};

function NavigationContent({ spaces, spaceSearch, collapsed = false }: NavigationContentProps) {
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
            <div key={space.id} className="group relative flex items-center">
              <NavLink
                to={`/spaces/${space.id}`}
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
            </div>
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
  useAppViewportHeight();
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const [spaceSearch, setSpaceSearch] = useState("");
  const leftCollapsed = useSidebarStore((s) => s.leftCollapsed);
  const toggleLeftSidebar = useSidebarStore((s) => s.toggleLeftSidebar);
  const location = useLocation();
  const isSpaceRoute = location.pathname.startsWith('/spaces/');
  const isSpaceDetailRoute = /^\/spaces\/\d+/.test(location.pathname);
  const isSpaceListRoute = location.pathname === '/spaces';
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

  return (
    // Height follows the visual viewport so the on-screen keyboard never covers the chat composer
    <div className="flex h-[var(--app-height,100dvh)] overflow-clip bg-transparent pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]">
      {isDesktop ? (
        <motion.aside
          initial={false}
          animate={{ width: leftCollapsed ? "5rem" : "20rem" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="surface-shell flex h-full shrink-0 flex-col border-r border-border overflow-hidden"
        >
          <SidebarTopBar
            spaceSearch={spaceSearch}
            onSpaceSearchChange={setSpaceSearch}
            collapsed={leftCollapsed}
            onToggleCollapse={toggleLeftSidebar}
          />
          <NavigationContent
            // Search input is hidden while collapsed, so show every space there
            spaces={leftCollapsed ? spaces : filteredSpaces}
            spaceSearch={leftCollapsed ? "" : spaceSearch}
            collapsed={leftCollapsed}
          />
        </motion.aside>
      ) : null}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-clip">
        {/* Phones: the space list and space pages have their own headers; other pages get a way back */}
        {!isDesktop && !isSpaceDetailRoute && !isSpaceListRoute ? (
          <header className="surface-shell flex h-14 shrink-0 items-center border-b border-border px-2">
            <Button variant="ghost" size="icon" className="h-11 w-11" asChild>
              <Link to="/spaces" aria-label="К списку спейсов">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </header>
        ) : null}

        <main className="min-h-0 flex-1 overflow-clip bg-transparent">
          {/* Instant swap: an exit animation here stacked old + new pages for a frame (jump/blink) */}
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {!isSpaceRoute ? <ProfileRail /> : null}
      <InstallAppSheet />
    </div>
  );
};
