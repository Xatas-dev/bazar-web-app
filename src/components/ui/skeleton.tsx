import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type SkeletonVariant = "pulse" | "shimmer" | "fade"

const variantClasses: Record<SkeletonVariant, string> = {
  pulse: "animate-pulse",
  shimmer: "animate-skeleton-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent",
  fade: "animate-skeleton-fade",
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  asChild?: boolean
}

const Skeleton = ({
  className,
  variant = "fade",
  asChild = false,
  ...props
}: SkeletonProps) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(variantClasses[variant], "rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonVariant }
