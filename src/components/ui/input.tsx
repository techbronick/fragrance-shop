import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-border bg-surface px-4 py-2 text-body text-text placeholder:text-text-faint transition-colors duration-instant ease-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-faint file:border-0 file:bg-transparent file:text-body file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
