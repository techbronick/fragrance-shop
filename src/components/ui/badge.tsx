import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-3 py-1 text-caption tracking-[0.06em] uppercase font-medium transition-colors duration-instant ease-default",
  {
    variants: {
      variant: {
        outline: "border-border text-text bg-transparent",
        soft:    "border-transparent bg-mocha-soft text-text-strong",
        // legacy aliases
        default:     "border-border text-text bg-transparent",
        secondary:   "border-transparent bg-mocha-soft text-text-strong",
        destructive: "border-transparent bg-error text-paper",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
