import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Add any additional props here if needed
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-sm border border-border bg-surface px-4 py-3 text-body text-text placeholder:text-text-faint transition-colors duration-instant ease-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-mocha focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-faint",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
