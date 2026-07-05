import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export const GuestLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="surface-shell border-b border-border">
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
      <main className="flex-1 bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
