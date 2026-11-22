import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getSpaceInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";

interface SpaceAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  /** Render a blurred copy of the avatar behind it, so its edge colors bleed outside the block */
  glow?: boolean;
  /** Tunes glow spread/intensity per size (blur-*, opacity-*, scale-*) */
  glowClassName?: string;
  /** `round` for lists and headers, `squircle` for the large settings avatar */
  shape?: "round" | "squircle";
}

const shapeClass = {
  round: "rounded-full",
  squircle: "rounded-[var(--space-avatar-radius)]",
} as const;

export function SpaceAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
  glow = false,
  glowClassName,
  shape = "round",
}: SpaceAvatarProps) {
  const radius = shapeClass[shape];
  const avatar = (
    <Avatar className={cn(radius, className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={`Аватар спейса ${name}`} className="object-cover" /> : null}
      <AvatarFallback
        className={cn(radius, "bg-primary font-semibold text-primary-foreground", fallbackClassName)}
      >
        {getSpaceInitials(name)}
      </AvatarFallback>
    </Avatar>
  );

  if (!glow) return avatar;

  return (
    <div className="relative isolate shrink-0">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 scale-110 overflow-hidden opacity-60 blur-md transition-opacity duration-300",
          radius,
          !avatarUrl && "bg-primary",
          glowClassName
        )}
      >
        {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      {avatar}
    </div>
  );
}
