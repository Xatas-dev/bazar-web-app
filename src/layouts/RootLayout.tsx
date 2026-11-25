import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import { useUser } from "@/hooks/useUser";
import { useWebPush } from "@/hooks/useWebPush";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingJoinCode, JOIN_PATH_PREFIX } from "@/lib/join";
import { clearLoginIntent, hasLoginIntent, isLandingPath, isPublicPath } from "@/lib/auth";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-dvh bg-transparent">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
);

export const RootLayout = () => {
  const location = useLocation();
  const isLanding = isLandingPath(location.pathname);

  // The landing page is static and makes no API calls. The only exception is coming back
  // from login (the OAuth redirect may land on "/"): then the session is checked once.
  const returningFromLogin = isLanding && (hasLoginIntent() || getPendingJoinCode() !== null);
  const { user, isLoading, isError, error } = useUser({ enabled: !isLanding || returningFromLogin });

  useWebPush(user);
  useServiceWorkerUpdate();

  // The login round trip is over once the session check settled
  const sessionResolved = !!user || isError;
  useEffect(() => {
    if (sessionResolved) clearLoginIntent();
  }, [sessionResolved]);

  if (isLanding && !returningFromLogin) {
    return <Outlet />;
  }

  // 401 on a protected page: the axios interceptor is already redirecting to login
  const isUnauthorized = isError && isAxiosError(error) && error.response?.status === 401;
  if (isLoading || (isUnauthorized && !isPublicPath(location.pathname))) {
    return <LoadingScreen />;
  }

  // Coming back from login after pressing "Отправить заявку" on an invite page
  // (the OAuth redirect may land on "/" or straight on "/spaces")
  const pendingJoinCode = user && (isLanding || location.pathname === "/spaces")
      ? getPendingJoinCode()
      : null;
  if (pendingJoinCode) {
      return <Navigate to={`${JOIN_PATH_PREFIX}${encodeURIComponent(pendingJoinCode)}`} replace />;
  }

  if (user && isLanding) {
      return <Navigate to="/spaces" replace />;
  }

  if (!user && !isPublicPath(location.pathname)) {
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
