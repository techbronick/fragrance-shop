import { Skeleton } from "@/components/ui/skeleton";

// Shimmer placeholder matching the BrandCard footprint used in BrandWall
// and BrandsView. Square image cell + one centered text row.
export function BrandCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="p-2">
        <div className="aspect-square rounded bg-muted overflow-hidden mb-2">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
        <Skeleton className="h-4 w-2/3 mx-auto rounded-sm" />
      </div>
    </div>
  );
}

export default BrandCardSkeleton;
