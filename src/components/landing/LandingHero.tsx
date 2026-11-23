import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowOrb } from "./LandingMotion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface LandingHeroProps {
  loginUrl: string;
}

export function LandingHero({ loginUrl }: LandingHeroProps) {
  return (
    <section id="about" className="relative isolate overflow-hidden pt-32 sm:pt-40">
      <div aria-hidden className="landing-dots absolute inset-0 -z-10" />
      <GlowOrb className="-left-32 top-10 h-[28rem] w-[28rem]" />
      <GlowOrb className="-right-24 top-48 h-[24rem] w-[24rem]" variant="secondary" delay={3} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:pb-14">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 text-center">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {["Мессенджер,"].map((word, i) => (
              <motion.span
                key={word}
                className="mx-[0.125em] inline-block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              className="landing-gradient-text block animate-gradient-pan pb-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT }}
            >
              рожденный из гигла*
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: EASE_OUT }}
            className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Bazar Space — открытый мессенджер для общения с неписотой, ебятами, близкими и вадом. Создавайте
            свои спейсы и подключайте к ним нужные модули(оснафку).
          </motion.p>

          <StartButton href={loginUrl} />
        </div>

      </div>
    </section>
  );
}

// Gold sparks rising around (and over) the button: position + size, sideways drift, timing
const SPARKS = [
  { className: "left-[2%] top-1/2 h-1.5 w-1.5", driftX: -18, delay: 0.0, duration: 2.4 },
  { className: "left-[6%] bottom-[10%] h-1 w-1", driftX: -10, delay: 0.9, duration: 2.0 },
  { className: "left-[12%] bottom-0 h-2 w-2", driftX: -6, delay: 1.6, duration: 2.8 },
  { className: "left-[18%] top-[20%] h-1 w-1", driftX: -4, delay: 0.4, duration: 1.8 },
  { className: "left-[24%] bottom-0 h-1.5 w-1.5", driftX: 4, delay: 2.1, duration: 2.6 },
  { className: "left-[30%] bottom-[5%] h-1 w-1", driftX: -8, delay: 1.2, duration: 2.2 },
  { className: "left-[37%] bottom-0 h-2 w-2", driftX: 6, delay: 0.2, duration: 3.0 },
  { className: "left-[44%] top-[15%] h-1 w-1", driftX: 0, delay: 1.9, duration: 1.9 },
  { className: "left-[50%] bottom-0 h-1.5 w-1.5", driftX: -4, delay: 0.7, duration: 2.5 },
  { className: "left-[56%] bottom-[8%] h-1 w-1", driftX: 8, delay: 2.4, duration: 2.1 },
  { className: "right-[37%] bottom-0 h-2 w-2", driftX: -6, delay: 1.4, duration: 2.9 },
  { className: "right-[31%] top-[25%] h-1 w-1", driftX: 4, delay: 0.5, duration: 1.8 },
  { className: "right-[25%] bottom-0 h-1.5 w-1.5", driftX: 8, delay: 1.0, duration: 2.6 },
  { className: "right-[19%] bottom-[12%] h-1 w-1", driftX: -4, delay: 2.2, duration: 2.0 },
  { className: "right-[13%] bottom-0 h-2 w-2", driftX: 10, delay: 0.3, duration: 2.8 },
  { className: "right-[8%] top-[30%] h-1 w-1", driftX: 14, delay: 1.7, duration: 2.2 },
  { className: "right-[3%] top-1/2 h-1.5 w-1.5", driftX: 18, delay: 0.8, duration: 2.4 },
  { className: "right-[5%] bottom-[15%] h-1 w-1", driftX: 12, delay: 2.6, duration: 2.0 },
];

/** Big "legendary" call-to-action: gold face, spinning gold rim, light sweep, tremble and rising sparks */
function StartButton({ href }: { href: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: EASE_OUT }}
      className="relative mt-2 flex items-center justify-center"
    >
      <motion.a
        href={href}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        // Short tremble every couple of seconds, like an item that can barely contain its power
        animate={{ rotate: [0, -1.2, 1.2, -1, 1, -0.5, 0], x: [0, -1.5, 1.5, -1, 1, -0.5, 0] }}
        transition={{
          rotate: { duration: 0.55, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" },
          x: { duration: 0.55, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" },
          default: { type: "spring", stiffness: 400, damping: 24 },
        }}
        className="landing-legendary rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="landing-legendary-face flex h-16 items-center px-14 text-xl font-extrabold uppercase tracking-[0.25em] sm:h-[4.5rem] sm:px-16 sm:text-2xl">
          Начать
        </span>
      </motion.a>

      {SPARKS.map(({ className, driftX, delay, duration }) => (
        <motion.span
          key={className}
          aria-hidden
          className={cn("pointer-events-none absolute z-10 rounded-full bg-[hsl(var(--landing-gold))] dark:bg-[hsl(var(--landing-gold-light))]", className)}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], x: driftX, y: -56, scale: [0.3, 1, 0.3] }}
          transition={{ duration, delay: 1 + delay, repeat: Infinity, repeatDelay: 0.3, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}
