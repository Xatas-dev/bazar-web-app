"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircleToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onChange'> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

const CircleToggle = React.forwardRef<HTMLButtonElement, CircleToggleProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-[var(--panel-disabled-opacity)]",
          checked
            ? "border-primary bg-primary"
            : "border-input bg-transparent hover:border-muted-foreground/50",
          className
        )}
        {...props}
      >
        {checked && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )}
      </button>
    )
  }
)
CircleToggle.displayName = "CircleToggle"

export { CircleToggle }
