import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useWebPush } from "@/hooks/useWebPush";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { Skeleton } from "@/components/ui/skeleton";

export const RootLayout = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  useWebPush(user);
  useServiceWorkerUpdate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="flex flex-col items-center space-y-4">
           <Skeleton className="h-12 w-12 rounded-full" />
           <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (user && location.pathname === "/") {
      return <Navigate to="/spaces" replace />;
  }

  if (!user && location.pathname !== "/") {
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
