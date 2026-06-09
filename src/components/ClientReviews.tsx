import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useEffect, useState, useMemo } from "react";
import { Star, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { productPath } from "@/utils/slugs";
import { formatPrice } from "@/utils/formatPrice";

// Each testimonial is tied to a specific perfume the customer talks about.
// Reviews whose product is out of stock or has no price at runtime are
// hidden, so the home roll only ever surfaces buyable products.
const reviews = [
  {
    id: 1,
    name: "Maria Popescu",
    rating: 5,
    productId: "09fe2461-41e2-40b4-b554-c4000e5389aa", // Bvlgari / Le Gemme Garanat
    comment: "Pentru o aniversare specială voiam ceva memorabil. Setul discovery mi-a permis să încerc Le Gemme Garanat înainte să mă decid. Compoziția mi-a stat în minte zile întregi. Am comandat sticla full și a sosit împachetată impecabil, ca un cadou.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
  {
    id: 2,
    name: "Alex Ionescu",
    rating: 5,
    productId: "0c900088-6d2e-43f0-ba2f-26dc0d4f4175", // Mancera / Red Tobacco
    comment: "Am vrut să încerc Mancera Red Tobacco fără să dau câteva sute pe sticlă, așa că am luat decantul de 10ml. Tutun bogat, condimente, sillage care durează tot timpul zilei. Livrare în 2 zile la Chișinău. modestshop este cel mai serios magazin de niche pe care l-am întâlnit.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
  {
    id: 3,
    name: "Elena Gheorghe",
    rating: 5,
    productId: "13e840ee-f4c8-41dc-8ab5-0c402146dab0", // Hfc / Devils Intrigue
    comment: "Caut de mult parfumuri rare și pe modestshop am descoperit Haute Fragrance Company, un brand pe care nu îl mai văzusem nicăieri în Moldova. Devils Intrigue e exact ce voiam: senzual, profund, distinct. Mostrele de 2ml sunt salvarea mea, nu mai cumpăr orb un flacon de 100ml.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
  {
    id: 4,
    name: "Cristian Munteanu",
    rating: 5,
    productId: "0d9803b9-eb74-4e0e-99fa-2469caf90a8f", // Louis Vuitton / Ombré Nomade
    comment: "Am cerut un sample de Ombré Nomade înainte să fac saltul la sticla LV. Oud-ul intens și nota de tamâie m-au cucerit complet. Ambalajul singur părea de bijuterie. Calitate de boutique, fără drumul la Paris.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
  {
    id: 5,
    name: "Andrei Diaconu",
    rating: 5,
    productId: "150dda75-b20c-4e0e-b533-781f30888327", // Attar Collection / Floral Musk
    comment: "Am scris pe Instagram cerând recomandări pentru un parfum feminin de seară. Mi s-a sugerat Attar Collection Floral Musk și a fost o alegere perfectă: mosc cremos, floral fără să fie greoi. La modestshop simți că vorbești cu cineva care chiar cunoaște parfumeria.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
  {
    id: 6,
    name: "Bogdan Stoica",
    rating: 5,
    productId: "08b5fb48-8ffe-4e73-a900-b2b38e2afe66", // AUM / Love Yourself
    comment: "Nu cunoșteam casa AUM până nu am încercat un sample de Love Yourself. Romantic, citric-floral, exact ce căutam. Tot ce e niche se poate testa întâi în mostră: singurul mod inteligent de a cumpăra parfum în 2026.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=75&fm=webp",
  },
];

type ProductWithStock = {
  id: string;
  brand: string;
  name: string;
  image_url: string | null;
  skus: { stock: number; price: number }[];
};

// Inline product card rendered below each review. The whole card is the
// link; the right-aligned CTA is decorative but provides a strong visual
// affordance ("Vezi parfumul") since a bare arrow tested as too quiet.
function ReviewProductChip({ product }: { product: ProductWithStock }) {
  const href = useLocalizedHref();
  const { t } = useTranslation("common");
  // "Starting from" price: cheapest in-stock SKU. We rely on the parent's
  // filter (only buyable products land here) to guarantee at least one
  // qualifying SKU, but the fallback to null keeps it safe either way.
  const fromPriceBani = useMemo(() => {
    const buyable = (product.skus ?? []).filter((s) => s.stock > 0 && s.price > 0);
    if (buyable.length === 0) return null;
    return buyable.reduce((min, s) => (s.price < min ? s.price : min), buyable[0].price);
  }, [product.skus]);

  return (
    <Link
      to={href(productPath(product))}
      aria-label={`${t("reviews.viewProduct")}: ${product.brand} ${product.name}`}
      className="group/chip block rounded-lg border border-border bg-paper p-3 hover:border-mocha/40 hover:shadow-sm transition-[border-color,box-shadow] duration-instant ease-default"
    >
      <div className="flex items-end gap-4">
        <div className="w-28 h-28 rounded bg-white shrink-0 overflow-hidden">
          <img
            src={product.image_url ?? ""}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-1.5"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-caption uppercase tracking-[0.06em] text-text-muted truncate">
            {product.brand}
          </div>
          <div className="text-body text-text-strong line-clamp-2">
            {product.name}
          </div>
          {fromPriceBani != null && (
            <div className="text-caption text-text-muted">
              {t("price.from")} {formatPrice(fromPriceBani)}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <span className="inline-flex items-center gap-1.5 text-caption uppercase tracking-[0.08em] text-mocha group-hover/chip:gap-2 transition-[gap] duration-instant ease-default">
          {t("reviews.viewProduct")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

const ClientReviews = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Batched fetch for the 6 review-linked products plus their SKUs, so we
  // can filter to those that are actually in stock with a price at runtime.
  const productIds = useMemo(() => reviews.map((r) => r.productId), []);
  const { data: products = [], isLoading } = useQuery<ProductWithStock[]>({
    queryKey: ["reviews-products", productIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, brand, name, image_url, skus(stock, price)")
        .in("id", productIds);
      if (error) throw error;
      return (data ?? []) as unknown as ProductWithStock[];
    },
    staleTime: 5 * 60 * 1000,
  });
  const inStockById = useMemo(() => {
    const m = new Map<string, ProductWithStock>();
    for (const p of products) {
      const buyable = (p.skus ?? []).some((s) => s.stock > 0 && s.price > 0);
      if (buyable) m.set(p.id, p);
    }
    return m;
  }, [products]);

  // While the query is in flight we show no reviews (rather than risk
  // surfacing one whose product turns out to be OOS). Once loaded we
  // keep only reviews whose product is buyable.
  const visibleReviews = useMemo(
    () => (isLoading ? [] : reviews.filter((r) => inStockById.has(r.productId))),
    [isLoading, inStockById],
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll logic for mobile only
  useEffect(() => {
    if (!isMobile || !isAutoScrolling) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        const cardWidth = container.querySelector('.review-card')?.clientWidth || 0;
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });

        // If at end, scroll back to start
        if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - cardWidth) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isMobile, isAutoScrolling]);

  // Pause auto-scroll on user interaction (mobile only)
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const container = carouselRef.current;
    const pauseAutoScroll = () => {
      setIsAutoScrolling(false);
      // Resume after 5 seconds
      setTimeout(() => setIsAutoScrolling(true), 5000);
    };

    container.addEventListener('touchstart', pauseAutoScroll);
    container.addEventListener('scroll', pauseAutoScroll);

    return () => {
      container.removeEventListener('touchstart', pauseAutoScroll);
      container.removeEventListener('scroll', pauseAutoScroll);
    };
  }, [isMobile]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // While the products query is in flight, render shimmer review cards
  // so the reviews section reserves space instead of disappearing while
  // we decide which reviews are buyable.
  if (isLoading) {
    const SkeletonReview = () => (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
          </div>
          <div className="mt-4 flex items-end gap-4 rounded-lg border border-border bg-paper p-3">
            <Skeleton className="w-28 h-28 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3 rounded-sm" />
              <Skeleton className="h-4 w-2/3 rounded-sm" />
              <Skeleton className="h-3 w-1/4 rounded-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
    if (isMobile) {
      return (
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex space-x-4 px-4 overflow-x-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <SkeletonReview />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonReview key={i} />
        ))}
      </div>
    );
  }

  if (visibleReviews.length === 0) return null;

  if (isMobile) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div
          className="carousel-container overflow-x-auto snap-x snap-mandatory"
          ref={carouselRef}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex space-x-4 px-4">
            {visibleReviews.map((review) => {
              const product = inStockById.get(review.productId);
              return (
                <div
                  key={review.id}
                  className="review-card flex-shrink-0 w-80 snap-start"
                  style={{ touchAction: 'pan-x' }}
                >
                  <Card className="h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar>
                          <AvatarImage src={review.image} alt={review.name} />
                          <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <div className="flex space-x-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                      {product && (
                        <div className="mt-auto pt-4">
                          <ReviewProductChip product={product} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <Carousel className="w-full max-w-6xl mx-auto">
      <CarouselContent className="-ml-2 md:-ml-4 hide-scrollbar-desktop">
        {visibleReviews.map((review) => {
          const product = inStockById.get(review.productId);
          return (
            <CarouselItem key={review.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 review-card">
              <Card className="h-full flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={review.image} alt={review.name} />
                      <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{review.name}</h3>
                      <div className="flex space-x-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                  {product && (
                    <div className="mt-auto pt-4">
                      <ReviewProductChip product={product} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ClientReviews;
