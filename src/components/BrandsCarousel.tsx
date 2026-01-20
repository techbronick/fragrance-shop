import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";

const brands = [
  {
    name: "Tom Ford",
    description: "Luxul american redefinit prin parfumuri de o eleganță incontestabilă",
    image: "/TomFord.webp",
    signature: "Oud Wood, Black Orchid, Lost Cherry"
  },
  {
    name: "Le Labo",
    description: "Parfumuri artizanale create în laboratorul din New York",
    image: "/Lelabo.webp",
    signature: "Santal 33, Rose 31, Bergamote 22"
  },
  {
    name: "Creed",
    description: "Casa regală de parfumuri cu tradiție de peste 260 de ani",
    image: "/Creed.webp",
    signature: "Aventus, Green Irish Tweed, Silver Mountain Water"
  },
  {
    name: "Parfums de Marly",
    description: "Parfumuri de lux inspirate de eleganța curții regale franceze",
    image: "/pdmarly.webp",
    signature: "Pegasus, Layton, Herod"
  },
  {
    name: "Amouage",
    description: "Casa de parfumuri din Oman cu compoziții complexe și opulente",
    image: "/Amouage.webp",
    signature: "Interlude, Jubilation XXV, Epic"
  },
  {
    name: "Xerjoff",
    description: "Parfumuri italiene de lux cu ingrediente rare și prețioase",
    image: "/Xerjoff.webp",
    signature: "Naxos, Erba Pura, Golden Moka"
  }
];

const BrandsCarousel = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleBrandClick = (brandName: string) => {
    navigate(`/shop?brand=${encodeURIComponent(brandName)}`);
  };

  const getFallbackImage = (index: number) => {
    const fallbackImages = [
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=400&h=400&q=75&fm=webp",
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=400&h=400&q=75&fm=webp",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?auto=format&fit=crop&w=400&h=400&q=75&fm=webp",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=400&h=400&q=75&fm=webp",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&h=400&q=75&fm=webp",
      "https://images.unsplash.com/photo-1594736797933-d0d6a0ad3b3c?auto=format&fit=crop&w=400&h=400&q=75&fm=webp"
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsAutoScrolling(false);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    e.preventDefault();
  };

  const scrollToNext = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.querySelector('.brand-carousel-card')?.clientWidth || 0;
    const nextIndex = (currentIndex + 1) % brands.length;
    setCurrentIndex(nextIndex);
    container.scrollTo({
      left: cardWidth * nextIndex,
      behavior: 'smooth'
    });
  };

  const scrollToPrev = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.querySelector('.brand-carousel-card')?.clientWidth || 0;
    const prevIndex = currentIndex === 0 ? brands.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    container.scrollTo({
      left: cardWidth * prevIndex,
      behavior: 'smooth'
    });
  };

  // Keep pagination in sync with scroll position on mobile
  const updateCurrentIndexFromScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const card = container.querySelector('.brand-carousel-card') as HTMLElement | null;
    if (!card) return;

    const cardWidth = card.clientWidth;
    if (!cardWidth) return;

    const index = Math.round(container.scrollLeft / cardWidth);
    if (index !== currentIndex && index >= 0 && index < brands.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  // Auto-scroll logic for mobile only
  useEffect(() => {
    if (!isMobile || !isAutoScrolling) return;
    
    const interval = setInterval(() => {
      scrollToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, isAutoScrolling, currentIndex]);

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

  // Update currentIndex when the user swipes manually (mobile)
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const container = carouselRef.current;
    const handleScroll = () => {
      updateCurrentIndexFromScroll();
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, updateCurrentIndexFromScroll]);

  if (isMobile) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div 
          className="carousel-container overflow-x-auto snap-x snap-mandatory"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex space-x-4 px-4">
            {brands.map((brand, index) => (
              <div 
                key={index} 
                className="brand-carousel-card flex-shrink-0 w-[85vw] max-w-sm snap-start"
                style={{ touchAction: 'pan-x' }}
              >
                <Card 
                  className="group transition-all duration-300 cursor-pointer h-full"
                  onClick={() => handleBrandClick(brand.name)}
                >
                  <CardContent className="p-6">
                    <div className="relative">
                                             <OptimizedImage
                         src={brand.image}
                         alt={`Brand parfum ${brand.name} - ${brand.description}`}
                         className="aspect-square rounded-lg mb-4 object-cover select-none touch-manipulation"
                         fallbackSrc={getFallbackImage(index)}
                         width={400}
                         height={400}
                         onError={() => handleImageError(index)}
                       />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-playfair font-medium">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {brand.description}
                      </p>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-primary font-medium">
                          {brand.signature}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mobile indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {brands.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                const container = carouselRef.current;
                if (container) {
                  const cardWidth = container.querySelector('.brand-carousel-card')?.clientWidth || 0;
                  container.scrollTo({
                    left: cardWidth * index,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/shop')}
          >
            Vezi toate
          </Button>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <>
      <Carousel className="w-full max-w-6xl mx-auto">
        <CarouselContent className="-ml-2 md:-ml-4 hide-scrollbar-desktop">
          {brands.map((brand, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 brand-carousel-card">
              <Card 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleBrandClick(brand.name)}
              >
                <CardContent className="p-6">
                  <OptimizedImage
                    src={brand.image}
                    alt={`Brand parfum ${brand.name} - ${brand.description}`}
                    className="aspect-square rounded-lg mb-4 group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc={getFallbackImage(index)}
                    width={400}
                    height={400}
                    onError={() => handleImageError(index)}
                  />
                  <div className="space-y-3">
                    <h3 className="text-xl font-playfair font-medium group-hover:text-primary transition-colors">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {brand.description}
                    </p>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-primary font-medium">
                        {brand.signature}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex justify-center mt-4">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/shop')}
        >
          Vezi toate
        </Button>
      </div>
    </>
  );
};

export default BrandsCarousel;
