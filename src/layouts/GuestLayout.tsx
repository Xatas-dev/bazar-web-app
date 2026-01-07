import { Outlet } from "react-router-dom";

export const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
           <div className="font-bold text-xl mr-8">Bazar Space</div>
           <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
              {/* Add guest nav links here if needed */}
           </nav>
           <div className="ml-auto flex items-center space-x-4">
               {/* Login button placeholder - will be handled in page */}
           </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
