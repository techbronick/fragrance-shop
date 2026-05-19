import { Skeleton } from "@/components/ui/skeleton";

// Shimmer placeholder matching the ProductCard footprint: square image
// area, three text rows (brand caption, name, price row with button).
// Use anywhere a list of ProductCards is rendered while data is in flight
// (NewArrivalsCarousel, brand grids, etc.) so the layout doesn't pop.
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="aspect-square bg-white p-[12%]">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3 rounded-sm" />
        <Skeleton className="h-4 w-3/4 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <Skeleton className="h-4 w-1/3 rounded-sm" />
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
