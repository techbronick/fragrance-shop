import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useRef, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const reviews = [
  {
    id: 1,
    name: "Maria Popescu",
    rating: 5,
    comment: "Parfumurile de la Scent Discovery Vault sunt absolut divine! Am comandat discovery set-ul și a fost o experiență incredibilă să încerc atâtea parfumuri de lux. Recomandat cu căldură!",
    image: "https://images.unsplash.com/photo-1494790108755-2616b9bb3458?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  },
  {
    id: 2,
    name: "Alex Ionescu",
    rating: 5,
    comment: "Calitatea produselor este excepțională. Am găsit parfumul perfect pentru mine prin discovery set-ul lor. Serviciul clienți a fost foarte profesionist.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  },
  {
    id: 3,
    name: "Elena Gheorghe",
    rating: 5,
    comment: "Sunt o mare iubitoare de parfumuri și această platformă mi-a deschis o lume nouă. Varietatea brandurilor premium este impresionantă!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  },
  {
    id: 4,
    name: "Cristian Munteanu",
    rating: 5,
    comment: "Discovery set-urile sunt perfecte pentru a explora noi parfumuri fără să te angajezi la o sticlă întreagă. Ambalajul este elegant și livarea rapidă.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  },
  {
    id: 5,
    name: "Andreea Diaconu",
    rating: 5,
    comment: "Recomand cu încredere! Am descoperit parfumul meu de semnătură prin discovery set-ul lor. Experiența de shopping online a fost fluidă și plăcută.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  },
  {
    id: 6,
    name: "Bogdan Stoica",
    rating: 5,
    comment: "Parfumurile sunt autentice și de calitate superioară. M-am îndrăgostit de mai multe branduri pe care nu le cunoșteam anterior. Mulțumesc pentru această experiență!",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=75&fm=webp"
  }
];

const ClientReviews = () => {
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
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="review-card flex-shrink-0 w-80 snap-start"
                style={{ touchAction: 'pan-x' }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar>
                        <AvatarImage src={review.image} alt={review.name} />
                        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.name}</h4>
                        <div className="flex space-x-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
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
        {reviews.map((review) => (
          <CarouselItem key={review.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 review-card">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={review.image} alt={review.name} />
                    <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <div className="flex space-x-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
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

export default ClientReviews;
