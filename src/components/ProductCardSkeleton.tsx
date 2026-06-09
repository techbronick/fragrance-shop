import { Skeleton } from "@/components/ui/skeleton";

// Shimmer placeholder matching the ProductCard footprint: square image
// area, three text rows (brand caption, name, price row with button).
// Use anywhere a list of ProductCards is rendered while data is in flight
// (NewArrivalsCarousel, brand grids, etc.) so the layout doesn't pop.
export function ProductCardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col rounded-lg border border-border bg-surface">
      <div className="w-full aspect-square shrink-0 bg-white p-[12%]">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
      <div className="p-3 space-y-2 flex flex-col flex-1">
        <Skeleton className="h-3 w-1/3 rounded-sm" />
        {/* Same 2-line reservation as the real card's name. */}
        <div className="min-h-[2lh]">
          <Skeleton className="h-4 w-3/4 rounded-sm" />
        </div>
        <Skeleton className="h-9 w-full rounded-sm" />
        <div className="flex items-center justify-between gap-2 pt-1 mt-auto min-h-9">
          <Skeleton className="h-4 w-1/3 rounded-sm" />
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
