import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { RootLayout } from "@/layouts/RootLayout";
import { GuestLayout } from "@/layouts/GuestLayout";
import { AppLayout } from "@/layouts/AppLayout";
import GuestPage from "@/pages/GuestPage";
import HomePage from "@/pages/HomePage";
import SpaceDashboardPage from "@/pages/SpaceDashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import JoinSpacePage from "@/pages/JoinSpacePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: <GuestPage />
          },
          {
            // Public invite preview, reachable with or without a session
            path: "join/:code",
            element: <JoinSpacePage />
          }
        ]
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "spaces",
            element: <HomePage />
          },
          {
            path: "spaces/:spaceId",
            element: <SpaceDashboardPage />
          },
          {
            path: "profile",
            element: <ProfilePage />
          }
        ]
      }
    ]
  }
]);

import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DialogHost } from "@/components/DialogHost"
import { MotionConfig } from "framer-motion"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation */}
      <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster />
        <DialogHost />
      </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
