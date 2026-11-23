import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "./LandingMotion";

interface Sponsor {
  firstName: string;
  lastName: string;
  /** Optional caption under the name */
  role?: string;
  /** Image URL: an imported file from src/static/sponsors/ or a public link */
  photo?: string;
  /** Bear cub peeking over the top-left of the avatar */
  bear?: boolean;
}

const SPONSORS: Sponsor[] = [
  {
    firstName: "Михаил",
    lastName: "Мирошников",
    role: "Tier 1",
    photo: "https://s3.bazar-space.ru/files-public/ec7fab22-695e-4dfc-8b3c-c90f1bb65e05_avatar.webp",
    bear: true,
  },
];

export function LandingSponsors() {
  return (
    <section id="sponsors" className="relative isolate mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-24 pt-8 sm:px-6 md:pb-32">
      <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Поддержка</span>
        <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Наши <span className="landing-gradient-text animate-gradient-pan">спонсоры</span>
        </h2>
        <p className="max-w-xl text-lg text-muted-foreground">Люди, которые верят в Bazar Space.</p>
      </Reveal>

      <Stagger className="flex flex-wrap justify-center gap-x-12 gap-y-10">
        {SPONSORS.map((sponsor) => {
          const fullName = `${sponsor.firstName} ${sponsor.lastName}`;
          return (
            <StaggerItem key={fullName} className="flex w-48 flex-col items-center gap-4 text-center">
              <div className="relative">
                {sponsor.bear && <BearCub />}
                <span className="landing-legendary p-1">
                <Avatar className="h-36 w-36 border-4 border-background">
                  {sponsor.photo && <AvatarImage src={sponsor.photo} alt={fullName} className="object-cover" />}
                  <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                    {getInitials(sponsor.firstName, sponsor.lastName)}
                  </AvatarFallback>
                </Avatar>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold">{fullName}</span>
                {sponsor.role && <span className="text-sm text-muted-foreground">{sponsor.role}</span>}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

/** Bear cub mascot hanging on to the avatar rim with its paws */
function BearCub() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -left-7 -top-8 z-10 h-20 w-20 origin-bottom-right"
      initial={{ opacity: 0, y: 16, rotate: -24 }}
      whileInView={{ opacity: 1, y: 0, rotate: -18 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 12 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        animate={{ rotate: [0, 6, 0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        {/* Ears */}
        <circle cx="22" cy="24" r="14" className="fill-[hsl(var(--landing-bear))]" />
        <circle cx="78" cy="24" r="14" className="fill-[hsl(var(--landing-bear))]" />
        <circle cx="22" cy="24" r="7" className="fill-[hsl(var(--landing-bear-light))]" />
        <circle cx="78" cy="24" r="7" className="fill-[hsl(var(--landing-bear-light))]" />
        {/* Head */}
        <ellipse cx="50" cy="54" rx="38" ry="33" className="fill-[hsl(var(--landing-bear))]" />
        {/* Cheeks */}
        <ellipse cx="25" cy="63" rx="7" ry="4.5" className="fill-[hsl(var(--landing-bear-blush))]" />
        <ellipse cx="75" cy="63" rx="7" ry="4.5" className="fill-[hsl(var(--landing-bear-blush))]" />
        {/* Eyes */}
        <circle cx="36" cy="49" r="5" className="fill-[hsl(var(--landing-bear-dark))]" />
        <circle cx="64" cy="49" r="5" className="fill-[hsl(var(--landing-bear-dark))]" />
        <circle cx="37.8" cy="47.2" r="1.7" className="fill-[hsl(var(--landing-bear-shine))]" />
        <circle cx="65.8" cy="47.2" r="1.7" className="fill-[hsl(var(--landing-bear-shine))]" />
        {/* Muzzle, nose and smile */}
        <ellipse cx="50" cy="65" rx="15" ry="11" className="fill-[hsl(var(--landing-bear-light))]" />
        <ellipse cx="50" cy="59.5" rx="6" ry="4.2" className="fill-[hsl(var(--landing-bear-dark))]" />
        <path
          d="M50 63.5 V67 M44 68 Q50 73 56 68"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="fill-none stroke-[hsl(var(--landing-bear-dark))]"
        />
        {/* Paws gripping the rim */}
        <ellipse cx="30" cy="90" rx="11" ry="8" className="fill-[hsl(var(--landing-bear))]" />
        <ellipse cx="70" cy="90" rx="11" ry="8" className="fill-[hsl(var(--landing-bear))]" />
        <ellipse cx="30" cy="92" rx="5" ry="3.5" className="fill-[hsl(var(--landing-bear-light))]" />
        <ellipse cx="70" cy="92" rx="5" ry="3.5" className="fill-[hsl(var(--landing-bear-light))]" />
      </motion.svg>
    </motion.div>
  );
}
