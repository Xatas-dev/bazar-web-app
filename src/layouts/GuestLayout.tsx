import { Outlet } from "react-router-dom";

export const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <main className="flex-1 bg-transparent">
        <Outlet />
      </main>
    </div>
  );
};
