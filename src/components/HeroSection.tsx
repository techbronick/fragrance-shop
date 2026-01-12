import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogosMarquee from "./BrandLogosMarquee";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleTestPerfume = () => {
    navigate('/discovery-sets');
  };

  const handleExploreCollection = () => {
    navigate('/shop');
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-accent/20" />
      
      <div className="container mx-auto px-4 pt-16 md:pt-20 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-medium tracking-tight leading-tight">
            Descoperă-ți
            <span className="block text-primary">Parfumul Semnătură</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experimentează cele mai fine parfumuri din lume prin colecția noastră selectată cu grijă. 
            De la mostre de 1ml până la sticle complete, găsește-ți perechea perfectă.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="group px-8 py-3" onClick={handleTestPerfume}>
              Test Parfum
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button size="lg" variant="outline" className="px-8 py-3" onClick={handleExploreCollection}>
              Explorează Colecția
            </Button>
          </div>
        </div>
        <div className="mt-24">
          <BrandLogosMarquee />
          
          {/* Worldwide Delivery accent */}
          <div className="inline-flex items-center gap-2 mt-8">
            <div className="h-px w-6 bg-gradient-to-r from-transparent to-primary/30"></div>
            <span className="text-xs font-inter font-medium tracking-[0.2em] text-primary/80 uppercase animate-pulse">
              Worldwide Delivery
            </span>
            <div className="h-px w-6 bg-gradient-to-l from-transparent to-primary/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
