import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { useRef, useEffect, useState } from "react";

const advertisementImages = [
  {
    id: "1",
    title: "Summer Collection 2025",
    subtitle: "Fresh & Citrusy",
    description: "Descoperă parfumurile perfecte pentru sezonul cald",
    image: "https://images.unsplash.com/photo-1594736797933-d0d6a0ad3b3c?auto=format&fit=crop&w=600&h=750&q=75&fm=webp",
    ctaText: "Explorează Colecția",
    badge: "Nou",
    backgroundColor: "from-blue-900/90 to-cyan-900/80"
  },
  {
    id: "2", 
    title: "Exclusive Launch",
    subtitle: "Limited Edition",
    description: "Parfumuri de lux disponibile doar pentru o perioadă limitată",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&h=750&q=75&fm=webp",
    ctaText: "Vezi Oferta",
    badge: "Exclusiv",
    backgroundColor: "from-purple-900/90 to-pink-900/80"
  },
  {
    id: "3",
    title: "Artisan Collection",
    subtitle: "Handcrafted Perfumes",
    description: "Parfumuri artizanale create manual de maeștri parfumieri",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&h=750&q=75&fm=webp",
    ctaText: "Descoperă Măiestria",
    badge: "Artizanal",
    backgroundColor: "from-amber-900/90 to-orange-900/80"
  },
  {
    id: "4",
    title: "Niche Fragrances",
    subtitle: "Rare & Unique",
    description: "Parfumuri de nișă rare, pentru cunoscători adevărați",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?auto=format&fit=crop&w=600&h=750&q=75&fm=webp",
    ctaText: "Explorează Raritatea",
    badge: "Rar",
    backgroundColor: "from-slate-900/90 to-gray-900/80"
  },
  {
    id: "5",
    title: "Celebrity Favorites",
    subtitle: "Red Carpet Ready",
    description: "Parfumurile preferate ale celebrităților de pe covorul roșu",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=750&q=75&fm=webp",
    ctaText: "Simt-te ca o Stea",
    badge: "Celebrity",
    backgroundColor: "from-rose-900/90 to-red-900/80"
  }
];

const NewArrivalsCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const handleAdClick = (ad: typeof advertisementImages[0]) => {
    // Add navigation logic here based on ad type
  };

  // Auto-scroll logic for mobile only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Disable auto-scroll on desktop (768px and above)
    if (window.innerWidth >= 768) return;
    if (!carouselRef.current) return;
    if (!isAutoScrolling) return;
    const container = carouselRef.current;
    let interval: NodeJS.Timeout;
    let cardWidth = 0;
    // Find a card to measure width
    const card = container.querySelector('.new-arrivals-carousel-card');
    if (card) cardWidth = (card as HTMLElement).offsetWidth;
    interval = setInterval(() => {
      if (container && cardWidth) {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        // If at end, scroll back to start
        if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - cardWidth) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Pause auto-scroll on user interaction (mobile only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only add interaction listeners on mobile
    if (window.innerWidth >= 768) return;
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const pause = () => setIsAutoScrolling(false);
    container.addEventListener('touchstart', pause);
    container.addEventListener('mousedown', pause);
    return () => {
      container.removeEventListener('touchstart', pause);
      container.removeEventListener('mousedown', pause);
    };
  }, []);

  return (
    <Carousel className="w-full max-w-6xl mx-auto">
      <CarouselContent className="-ml-2 md:-ml-4 hide-scrollbar-desktop" ref={carouselRef} style={{ scrollBehavior: 'smooth', overflowX: 'auto' }}>
        {advertisementImages.map((ad) => (
          <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 new-arrivals-carousel-card">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <OptimizedImage
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=750&q=75&fm=webp"
                    width={600}
                    height={750}
                  />
                  
                  {/* Overlay with gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${ad.backgroundColor}`}></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="font-bold bg-white/20 text-white border-white/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {ad.badge}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm opacity-90 font-medium">{ad.subtitle}</p>
                        <h3 className="text-xl font-bold leading-tight">{ad.title}</h3>
                        <p className="text-sm opacity-80 mt-2 line-clamp-2">
                          {ad.description}
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" 
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdClick(ad)}
                      >
                        {ad.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default NewArrivalsCarousel;
