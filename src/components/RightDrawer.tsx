import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BREAKPOINTS, useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

const transition = { duration: 0.18, ease: "easeOut" } as const;

/**
 * Right-side panel (profile, space settings).
 * - `xl` and up: docked next to the content, pushing it aside.
 * - Below `xl`: slides over the content with a backdrop; full width on phones.
 * Open state comes from history (`usePanel`), so the system back gesture closes it.
 */
export function RightDrawer({ open, onClose, children, id, "aria-label": ariaLabel, className }: RightDrawerProps) {
  const docked = useMediaQuery(BREAKPOINTS.xl);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (docked) {
    return (
      <AnimatePresence mode="wait">
        {open && (
          <motion.aside
            key="docked"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "var(--right-sidebar-width)", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={transition}
            id={id}
            role="complementary"
            aria-label={ariaLabel}
            className={cn(
              "surface-shell flex h-full max-w-[var(--right-sidebar-width)] shrink-0 flex-col overflow-hidden border-l border-border",
              className
            )}
          >
            {/* Fixed-width content: only the outer width animates, so text doesn't re-wrap every frame */}
            <div className="flex h-full min-h-0 w-[var(--right-sidebar-width)] shrink-0 flex-col">{children}</div>
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="surface-overlay fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.aside
          key="overlay-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn(
            "surface-shell fixed right-0 top-0 z-40 flex h-[var(--app-height,100dvh)] w-full max-w-[var(--right-sidebar-width)] flex-col overflow-hidden border-l border-border pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]",
            className
          )}
        >
          {children}
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body
  );
}
