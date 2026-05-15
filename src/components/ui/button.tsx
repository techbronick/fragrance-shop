import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium " +
  "transition-colors duration-instant ease-default " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:   "bg-mocha text-paper hover:bg-mocha-hover",
        secondary: "bg-surface text-text border border-border hover:bg-surface-2",
        ghost:     "bg-transparent text-text hover:bg-surface-2",
        // shadcn legacy aliases: point them at the new variants so old call sites still work
        default:     "bg-mocha text-paper hover:bg-mocha-hover",
        outline:     "bg-surface text-text border border-border hover:bg-surface-2",
        link:        "bg-transparent text-mocha underline-offset-4 hover:underline",
        destructive: "bg-error text-paper hover:opacity-90",
      },
      size: {
        sm:   "h-8 px-3 text-caption",
        md:   "h-10 px-4 text-body",
        lg:   "h-12 px-6 text-body-lg",
        icon: "h-10 w-10",
        default: "h-10 px-4 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
