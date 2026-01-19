import { Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">ModestShop</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curatorii parfumurilor excepționale pentru pasionații de parfumuri din Republica Moldova. 
              Descoperă-ți parfumul semnătură prin colecția noastră selectată cu grijă.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/modest.shops/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </a>
              <a href="https://www.facebook.com/modest.shops/" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-medium">Magazin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Branduri</Link></li>
              <li><Link to="/shop?products=all" className="hover:text-primary transition-colors">Toate Produsele</Link></li>
              <li><Link to="/discovery-sets" className="hover:text-primary transition-colors">Seturi Discovery</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-medium">Suport</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contactează-ne</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">Întrebări Frecvente</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-medium">Companie</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">Despre Noi</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Jurnal</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Cariere</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Politica de Confidențialitate</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Termeni și Condiții</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ModestShop. Toate drepturile rezervate. • Republica Moldova</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
