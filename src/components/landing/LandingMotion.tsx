import type { PointerEvent, ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}

/** Fades and slides its content in the first time it scrolls into view */
export function Reveal({ children, className, delay = 0, from = "bottom" }: RevealProps) {
  const offset = from === "left" ? { x: -40 } : from === "right" ? { x: 40 } : { y: 28 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

/** Container whose `StaggerItem` children reveal one after another */
export function Stagger({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

/** Writes the pointer position into --spot-x / --spot-y for `.landing-spotlight` */
function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

/** Panel card with a cursor-following highlight and a lift on hover */
export function SpotlightCard({ children, className, href }: SpotlightCardProps) {
  const classes = cn(
    "surface-panel landing-spotlight group flex h-full flex-col gap-4 rounded-lg p-6 transition-colors duration-300 hover:border-primary/60",
    className
  );

  if (href) {
    return (
      <motion.a
        href={href}
        onPointerMove={trackSpotlight}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={classes}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div
      onPointerMove={trackSpotlight}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={classes}
    >
      {children}
    </motion.div>
  );
}

/** Soft, slowly drifting ambient glow behind a section */
export function GlowOrb({ className, variant = "primary", delay = 0 }: { className?: string; variant?: "primary" | "secondary"; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full",
        variant === "primary" ? "landing-glow" : "landing-glow-secondary",
        className
      )}
      animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.96, 1] }}
      transition={{ duration: 16, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
