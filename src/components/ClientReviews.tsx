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
    comment: "Am descoperit la modestshop parfumul perfect pentru mine. Setul discovery 5×2ml mi-a permis să încerc câteva variante reale, fără presiune, înainte să mă decid pe Baccarat Rouge 540. Pachetul a venit împachetat impecabil, ca un cadou. Comand fără ezitare.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
  },
  {
    id: 2,
    name: "Alex Ionescu",
    rating: 5,
    comment: "Am comandat un Tom Ford Vanille Fatale și un Aventus de la Creed. Ambele 100% autentice, identice cu cele testate în boutique. Livrare în 2 zile la Chișinău. modestshop este cel mai serios magazin de niche pe care l-am întâlnit.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
  },
  {
    id: 3,
    name: "Elena Gheorghe",
    rating: 5,
    comment: "Caut de mult parfumuri rare și pe modestshop am găsit branduri pe care nu le mai văzusem nicăieri în Moldova: Hormone Paris, AUM, Ex Nihilo. Mostrele de 2ml sunt salvarea mea: nu mai cumpăr orb un flacon de 100ml. Mulțumesc!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
  },
  {
    id: 4,
    name: "Cristian Munteanu",
    rating: 5,
    comment: "Am luat un set discovery pentru ziua soției: 8 mostre alese personalizat din mai multe case de niche. Ambalajul singur părea de bijuterie. Zile întregi a încercat câte unul. Cea mai bună idee de cadou din ultimii ani.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
  },
  {
    id: 5,
    name: "Andreea Diaconu",
    rating: 5,
    comment: "Am scris pe Instagram cu o întrebare despre un Parfums de Marly și mi-au răspuns în 5 minute, cu recomandări reale, nu copy-paste. La modestshop simți că vorbești cu cineva care chiar cunoaște parfumeria. Experiență premium de la cap la coadă.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
  },
  {
    id: 6,
    name: "Bogdan Stoica",
    rating: 5,
    comment: "Înainte să dau câteva mii de lei pe un flacon de Le Labo Santal 33, am luat un sample de 2ml de pe modestshop. Mi s-a părut corect. Tot ce e niche se poate testa întâi în mostră: singurul mod inteligent de a cumpăra parfum în 2026.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=75&fm=webp"
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
                        <h3 className="font-semibold">{review.name}</h3>
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
                    <h3 className="font-semibold">{review.name}</h3>
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
