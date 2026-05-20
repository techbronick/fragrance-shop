import { Skeleton } from "@/components/ui/skeleton";

// Shimmer placeholder matching the BrandCard footprint used in BrandWall
// and BrandsView. Square image cell + one centered text row.
export function BrandCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-lg border border-border bg-surface">
      <div className="w-full aspect-square shrink-0 bg-white overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-3 space-y-1 flex flex-col flex-1">
        <div className="min-h-[2lh]">
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>
        <Skeleton className="h-3 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

export default BrandCardSkeleton;
