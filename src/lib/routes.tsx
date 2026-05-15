import { lazy, Suspense } from "react";
import type { RouteRecord } from "vite-react-ssg";
import { Navigate } from "react-router-dom";
import App from "@/App";
import { LanguageGate } from "@/components/LanguageGate";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Shop from "@/pages/Shop";
import Brand from "@/pages/Brand";
import Product from "@/pages/Product";
import DiscoverySets from "@/pages/DiscoverySets";
import NotFound from "@/pages/NotFound";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Careers from "@/pages/Careers";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/Login";
import OrderConfirmation from "@/pages/OrderConfirmation";

const Admin = lazy(() => import("@/pages/Admin"));
const DiscoverySetProduct = lazy(() => import("@/pages/DiscoverySetProduct"));
const OrderDetails = lazy(() => import("@/components/admin/OrderDetails"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const langs = ["ro", "ru", "en"] as const;

// Static paths to pre-render for every language (dynamic data routes are added in Task 7)
const staticPaths = [
  "",                        // /:lang -> Index
  "shop",
  "discovery-sets",
  "discovery-sets/builder",
  "discovery-sets/recommend",
  "about",
  "contact",
  "faq",
  "careers",
  "privacy",
  "terms",
  "login",
];

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/ro" replace /> },
      {
        path: ":lang",
        element: <LanguageGate />,
        children: [
          { index: true, element: <Index /> },
          { path: "shop", element: <Shop /> },
          { path: "brand/:slug", element: <Brand /> },
          // Slug route: primary
          { path: "product/:brandSlugParam/:productSlugParam", element: <Product /> },
          // Legacy UUID route: redirects to slug inside Product.tsx
          { path: "product/:idOrBrandSlug", element: <Product /> },
          { path: "discovery-sets", element: <DiscoverySets /> },
          { path: "discovery-sets/builder", element: <DiscoverySets /> },
          { path: "discovery-sets/recommend", element: <DiscoverySets /> },
          {
            path: "discovery-set/:slugOrId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DiscoverySetProduct />
              </Suspense>
            ),
          },
          { path: "checkout", element: <Checkout /> },
          { path: "login", element: <Login /> },
          { path: "about", element: <About /> },
          { path: "contact", element: <Contact /> },
          { path: "faq", element: <FAQ /> },
          { path: "careers", element: <Careers /> },
          { path: "privacy", element: <Privacy /> },
          { path: "terms", element: <Terms /> },
          { path: "orders/:orderId", element: <OrderConfirmation /> },
          {
            path: "admin",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/orders/:orderId",
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <OrderDetails />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
];

/**
 * Returns the list of static paths to pre-render.
 * Dynamic data routes (product, brand, discovery-set) are added in Task 7.
 */
export function includedRoutes(paths: string[]): string[] {
  const staticSet = new Set(
    langs.flatMap((lang) =>
      staticPaths.map((p) => (p ? `/${lang}/${p}` : `/${lang}`))
    )
  );
  // Always include "/" (the root redirect)
  staticSet.add("/");
  return paths.filter((p) => staticSet.has(p));
}
