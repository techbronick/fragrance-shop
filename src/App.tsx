import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LanguageGate } from "@/components/LanguageGate";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import OrderConfirmation from "./pages/OrderConfirmation";
import Product from "./pages/Product";
import DiscoverySets from "./pages/DiscoverySets";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Careers from "./pages/Careers";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Brand from "./pages/Brand";

const Admin = lazy(() => import("./pages/Admin"));
const DiscoverySetProduct = lazy(() => import("./pages/DiscoverySetProduct"));
const OrderDetails = lazy(() => import("./components/admin/OrderDetails"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/ro" replace />} />
            <Route path="/:lang" element={<LanguageGate />}>
              <Route index element={<Index />} />
              <Route path="shop" element={<Shop />} />
              <Route path="brand/:slug" element={<Brand />} />
              <Route path="product/:brandSlugParam/:productSlugParam" element={<Product />} />
              <Route path="product/:idOrBrandSlug" element={<Product />} />
              <Route path="discovery-sets" element={<DiscoverySets />} />
              <Route path="discovery-sets/builder" element={<DiscoverySets />} />
              <Route path="discovery-sets/recommend" element={<DiscoverySets />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route
                path="discovery-set/:slugOrId"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DiscoverySetProduct />
                  </Suspense>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Admin />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <OrderDetails />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="careers" element={<Careers />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="orders/:orderId" element={<OrderConfirmation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
