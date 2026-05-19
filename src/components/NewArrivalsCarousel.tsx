import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Product, SKU } from "@/types/database";

type Props = {
  products: Product[];
  skusByProduct?: Map<string, SKU[]>;
  isLoading?: boolean;
};

const NewArrivalsCarousel = ({ products, skusByProduct, isLoading }: Props) => {
  // Show shimmer placeholders while the newest-products query is in
  // flight so the section reserves space and feels alive instead of
  // popping in once data lands.
  if (isLoading && (!products || products.length === 0)) {
    return (
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CarouselItem
              key={i}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"
            >
              <ProductCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }
  if (!products || products.length === 0) return null;

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4 py-4">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"
          >
            <ProductCard
              product={product}
              skus={skusByProduct ? (skusByProduct.get(product.id) ?? []) : undefined}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default NewArrivalsCarousel;
