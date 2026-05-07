import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-sm skeleton-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
