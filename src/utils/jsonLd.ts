import type { Product, SKU } from "@/types/database";
import { brandSlug, productSlug } from "@/utils/slugs";

const SITE = "https://modestshop.md";

export function organizationJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ModestShop",
    "url": `${SITE}/${lang}`,
    "logo": `${SITE}/logo.png`,
    "sameAs": ["https://www.instagram.com/modest.shops/"],
  };
}

export function websiteJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": `${SITE}/${lang}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE}/${lang}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(p: Product, skus: SKU[], lang: string) {
  const priced = skus.filter((s) => s.price > 0);
  const inStockPriced = priced.filter((s) => s.stock > 0);
  const minLei = priced.length > 0 ? Math.min(...priced.map((s) => s.price)) / 100 : null;

  let availability = "https://schema.org/PreOrder";
  if (inStockPriced.length > 0) availability = "https://schema.org/InStock";
  else if (priced.length > 0) availability = "https://schema.org/OutOfStock";

  const url = `${SITE}/${lang}/product/${brandSlug(p.brand)}/${productSlug(p.name)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "image": p.image_url,
    "description": p.description ?? `${p.brand} ${p.name}`,
    "brand": { "@type": "Brand", "name": p.brand },
    "category": p.family ?? undefined,
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "MDL",
      ...(minLei !== null ? { "price": minLei.toFixed(2) } : {}),
      "availability": availability,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": it.name,
      "item": it.url,
    })),
  };
}

export function itemListJsonLd(products: Product[], lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE}/${lang}/product/${brandSlug(p.brand)}/${productSlug(p.name)}`,
      "name": p.name,
    })),
  };
}

export function faqJsonLd(qas: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": qas.map((it) => ({
      "@type": "Question",
      "name": it.q,
      "acceptedAnswer": { "@type": "Answer", "text": it.a },
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ModestShop",
    "image": `${SITE}/logo.png`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MD",
      "addressLocality": "Chișinău",
    },
    "url": SITE,
    "priceRange": "$$",
  };
}
