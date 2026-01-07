import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";

export const RootLayout = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
           <Skeleton className="h-12 w-12 rounded-full" />
           <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // If user is logged in, but on root or guest paths, redirect to app home (e.g. /home or /spaces)
  if (user && (location.pathname === "/" || location.pathname === "/guest")) {
      return <Navigate to="/spaces" replace />;
  }

  // If user is NOT logged in, but tries to access protected routes, redirect to guest/landing
  if (!user && location.pathname !== "/" && location.pathname !== "/guest") {
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
