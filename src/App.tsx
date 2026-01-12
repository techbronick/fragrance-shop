import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Product from "./pages/Product";
import DiscoverySets from "./pages/DiscoverySets";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";

// Lazy load heavy components
const Admin = lazy(() => import("./pages/Admin"));
const DiscoverySetProduct = lazy(() => import("./pages/DiscoverySetProduct"));

// Import Header and Footer for placeholder pages
import Header from "./components/Header";
import Footer from "./components/Footer";

// Create lazy-loaded placeholder pages for better SEO and navigation
const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center pt-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <p className="text-sm text-muted-foreground">Această pagină va fi disponibilă în curând.</p>
      </div>
    </main>
    <Footer />
  </div>
);

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/discovery-sets" element={<DiscoverySets />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/discovery-set/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <DiscoverySetProduct />
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            } 
          />
          
          {/* Static/Information Pages with proper URLs for SEO */}
          <Route 
            path="/about" 
            element={<PlaceholderPage title="Despre Noi" description="Află mai multe despre misiunea noastră de a aduce cele mai fine parfumuri la tine acasă." />} 
          />
          <Route 
            path="/blog" 
            element={<PlaceholderPage title="Jurnal" description="Descoperă cele mai noi tendințe în parfumuri și povești din lumea fragrancelor." />} 
          />
          <Route 
            path="/contact" 
            element={<PlaceholderPage title="Contactează-ne" description="Suntem aici să te ajutăm cu orice întrebări sau nelămuriri." />} 
          />
          <Route 
            path="/faq" 
            element={<PlaceholderPage title="Întrebări Frecvente" description="Găsește răspunsuri la cele mai comune întrebări despre produsele și serviciile noastre." />} 
          />
          <Route 
            path="/shipping" 
            element={<PlaceholderPage title="Informații Livrare" description="Detalii despre opțiunile de livrare și politicile noastre de transport." />} 
          />
          <Route 
            path="/size-guide" 
            element={<PlaceholderPage title="Ghid Dimensiuni" description="Ghid pentru a alege dimensiunea perfectă a parfumului pentru nevoile tale." />} 
          />
          <Route 
            path="/careers" 
            element={<PlaceholderPage title="Cariere" description="Alătură-te echipei noastre și fii parte din lumea parfumurilor de lux." />} 
          />
          <Route 
            path="/privacy" 
            element={<PlaceholderPage title="Politica de Confidențialitate" description="Informații despre cum protejăm și folosim datele tale personale." />} 
          />
          <Route 
            path="/terms" 
            element={<PlaceholderPage title="Termeni și Condiții" description="Condițiile de utilizare a site-ului și serviciilor noastre." />} 
          />
          <Route path="/orders/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
