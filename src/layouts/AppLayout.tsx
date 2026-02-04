import { Outlet, Link, NavLink } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useSpaces, useDeleteSpace } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LogOut,
  Settings,
  User,
  Box,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
  const { user } = useUserStore();
  const { data: spacesData } = useSpaces();
  const { mutate: deleteSpace } = useDeleteSpace();
  const spaces = spacesData?.spaces || [];

  const handleDeleteSpace = (e: React.MouseEvent, spaceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this space?")) {
      deleteSpace(spaceId);
    }
  };

  const handleLogout = async () => {
      try {
          await fetch('/api/logout', { method: 'POST' });
          window.location.href = '/';
      } catch (e) {
          console.error("Logout failed", e);
      }
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b flex-shrink-0">
           <Link to="/spaces" className="flex items-center">
             <Box className="h-6 w-6 mr-2" />
             <span className="font-bold text-xl">Bazar Space</span>
           </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
            <div className="px-4 space-y-4">
                <nav className="space-y-1">
                    <h3 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                        My Spaces
                    </h3>
                    <Button variant="ghost" className="w-full justify-start mb-2" asChild>
                        <Link to="/spaces">
                             <Plus className="mr-2 h-4 w-4" /> Create Space
                        </Link>
                    </Button>
                    {spaces.map(space => (
                        <div key={space.id} className="group flex items-center relative">
                            <NavLink
                                to={`/spaces/${space.id}`}
                                className={({ isActive }) => cn(
                                    "flex-1 flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                    isActive ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <Box className="mr-2 h-4 w-4" />
                                {space.name}
                            </NavLink>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={(e) => handleDeleteSpace(e, space.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </nav>
            </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto bg-card flex-shrink-0">
            <nav className="space-y-1 mb-4">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </nav>
            <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                    <AvatarImage src={user?.userPic || ""} />
                    <AvatarFallback>{user?.userName?.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.userName}</span>
                    <span className="text-xs text-muted-foreground truncate">User</span>
                </div>
            </div>
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Header */}
          <header className="h-16 border-b md:hidden flex items-center px-4 bg-card flex-shrink-0">
              <Link to="/spaces">
                <Box className="h-6 w-6 mr-2" />
              </Link>
              <span className="font-bold text-lg">Bazar Space</span>
          </header>

          <main className="flex-1 overflow-y-auto bg-background">
              <Outlet />
          </main>
      </div>
    </div>
  );
};
