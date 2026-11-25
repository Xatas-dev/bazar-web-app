import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useWebPush } from "@/hooks/useWebPush";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingJoinCode, JOIN_PATH_PREFIX } from "@/lib/join";

export const RootLayout = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  useWebPush(user);
  useServiceWorkerUpdate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-transparent">
        <div className="flex flex-col items-center space-y-4">
           <Skeleton className="h-12 w-12 rounded-full" />
           <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // Invite pages are public: guests see the preview, members can send a request
  const isJoinPage = location.pathname.startsWith(JOIN_PATH_PREFIX);

  // Coming back from login after pressing "Отправить заявку" on an invite page
  // (the OAuth redirect may land on "/" or straight on "/spaces")
  const pendingJoinCode = user && (location.pathname === "/" || location.pathname === "/spaces")
      ? getPendingJoinCode()
      : null;
  if (pendingJoinCode) {
      return <Navigate to={`${JOIN_PATH_PREFIX}${encodeURIComponent(pendingJoinCode)}`} replace />;
  }

  if (user && location.pathname === "/") {
      return <Navigate to="/spaces" replace />;
  }

  if (!user && location.pathname !== "/" && !isJoinPage) {
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
