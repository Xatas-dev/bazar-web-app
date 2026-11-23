import faviconBlack from "@/static/favicon-black.svg";
import { cn } from "@/lib/utils";

interface LandingLogoProps {
  size?: "md" | "lg";
}

export function LandingLogo({ size = "md" }: LandingLogoProps) {
  const icon = size === "lg" ? "h-10 w-10 sm:h-12 sm:w-12" : "h-8 w-8";

  return (
    <span className="flex items-center gap-3">
      <img src={faviconBlack} alt="" className={icon} />
      <span
        className={cn(
          "font-extrabold tracking-tight text-foreground",
          size === "lg" ? "text-xl sm:text-2xl" : "text-lg"
        )}
      >
        Bazar Space
      </span>
    </span>
  );
}
