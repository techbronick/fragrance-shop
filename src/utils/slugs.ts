import type { Product } from "@/types/database";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[×x](?=\d)/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const brandSlug = (brand: string) => slugify(brand);
export const productSlug = (name: string) => slugify(name);
export const setSlug = (name: string) => slugify(name);

export function productPath(p: { brand: string; name: string }): string {
  return `/product/${brandSlug(p.brand)}/${productSlug(p.name)}`;
}

export function setPath(c: { name: string }): string {
  return `/discovery-set/${setSlug(c.name)}`;
}

export function brandPath(brand: string): string {
  return `/brand/${brandSlug(brand)}`;
}

export function findProductByPath<T extends { brand: string; name: string; created_at: string }>(
  products: T[],
  brandSlugParam: string,
  productSlugParam: string,
): T | null {
  const matches = products.filter(
    (p) => brandSlug(p.brand) === brandSlugParam && productSlug(p.name) === productSlugParam,
  );
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
}

export function findSetBySlug<T extends { name: string; created_at: string }>(
  sets: T[],
  slug: string,
): T | null {
  const matches = sets.filter((s) => setSlug(s.name) === slug);
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
