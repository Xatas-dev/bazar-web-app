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

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                index: true,
                element: <GuestPage />
            }
        ]
      },
      {
        path: "/guest",
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: <GuestPage />
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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
