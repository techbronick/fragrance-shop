import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Percent, Clock, ArrowRight } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { useRef, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const advertisementCards = [
  {
    id: 1,
    title: "Black Friday",
    subtitle: "Reduceri până la 50%",
    description: "Cele mai mari reduceri ale anului la parfumurile premium",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&h=400&q=75&fm=webp",
    badge: "REDUCERE",
    backgroundColor: "from-black/60 to-black/30",
    offer: "50% OFF"
  },
  {
    id: 2,
    title: "Discovery Sets",
    subtitle: "Explorează noi arome",
    description: "5 moste de 2ml la doar 89 RON",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&h=400&q=75&fm=webp",
    badge: "NOU",
    backgroundColor: "from-purple-900/60 to-purple-700/30",
    offer: "89 RON"
  },
  {
    id: 3,  
    title: "Premium Collection",
    subtitle: "Tom Ford & Creed",
    description: "Parfumurile de lux pe care le meriți",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&h=400&q=75&fm=webp",
    badge: "EXCLUSIV",
    backgroundColor: "from-amber-900/60 to-amber-700/30",
    offer: "PREMIUM"
  },
  {
    id: 4,
    title: "Livrare Gratuită",
    subtitle: "Pentru comenzi peste 200 RON",
    description: "Profită de transportul gratuit în toată țara",
    image: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?auto=format&fit=crop&w=600&h=400&q=75&fm=webp",
    badge: "TRANSPORT",
    backgroundColor: "from-green-900/60 to-green-700/30",
    offer: "GRATUIT"
  },
  {
    id: 5,
    title: "Sample Program",
    subtitle: "Încearcă înainte să cumperi",
    description: "Comandă mostre pentru a descoperi parfumul perfect",
    image: "https://images.unsplash.com/photo-1594736797933-d0d6a0ad3b3c?auto=format&fit=crop&w=600&h=400&q=75&fm=webp",
    badge: "PERSONALIZAT",
    backgroundColor: "from-rose-900/60 to-rose-700/30",
    offer: "MOSTRE"
  }
];

const SalesCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
        const cardWidth = container.querySelector('.sales-card')?.clientWidth || 0;
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        
        // If at end, scroll back to start
        if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - cardWidth) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, isAutoScrolling]);

  // Pause auto-scroll on user interaction (mobile only)
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;
    
    const container = carouselRef.current;
    const pauseAutoScroll = () => {
      setIsAutoScrolling(false);
      setTimeout(() => setIsAutoScrolling(true), 8000);
    };

    container.addEventListener('touchstart', pauseAutoScroll);
    container.addEventListener('scroll', pauseAutoScroll);
    
    return () => {
      container.removeEventListener('touchstart', pauseAutoScroll);
      container.removeEventListener('scroll', pauseAutoScroll);
    };
  }, [isMobile]);

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
            {advertisementCards.map((ad) => (
              <div 
                key={ad.id} 
                className="sales-card flex-shrink-0 w-80 snap-start"
                style={{ touchAction: 'pan-x' }}
              >
                <Card className="group transition-all duration-300 border-primary/20 overflow-hidden h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <OptimizedImage
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover select-none touch-manipulation"
                        fallbackSrc="https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=400&q=75&fm=webp"
                        width={600}
                        height={400}
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
                      
                      {/* Offer Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-sm">
                          {ad.offer}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-playfair font-bold mb-2">{ad.title}</h3>
                        <p className="text-lg font-medium mb-1 opacity-90">{ad.subtitle}</p>
                        <p className="text-sm opacity-80 mb-4">{ad.description}</p>
                        <Button variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                          Descoperă
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <Carousel className="w-full max-w-6xl mx-auto">
      <CarouselContent className="-ml-2 md:-ml-4 hide-scrollbar-desktop">
        {advertisementCards.map((ad) => (
          <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 sales-card">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=400&q=75&fm=webp"
                    width={600}
                    height={400}
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
                  
                  {/* Offer Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-sm">
                      {ad.offer}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-playfair font-bold mb-2">{ad.title}</h3>
                    <p className="text-lg font-medium mb-1 opacity-90">{ad.subtitle}</p>
                    <p className="text-sm opacity-80 mb-4">{ad.description}</p>
                    <Button variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                      Descoperă
                    </Button>
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
  );
};

export default SalesCarousel;
