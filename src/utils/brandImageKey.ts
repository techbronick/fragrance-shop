// src/utils/brandImageKey.ts
//
// Supabase Storage object keys must be ASCII — a brand name like "Chloé"
// cannot be used verbatim as a key (the upload is rejected with
// "Invalid key"). We fold accented characters to their ASCII base so the
// key is valid, and apply the SAME transform on both the upload side and
// the public-URL lookup side so they always agree.
//
// Note: punctuation such as ":" and "&" *is* accepted by Supabase Storage,
// so it is left untouched — only non-ASCII letters need folding. For brand
// names that are already plain ASCII (the vast majority) this is a no-op.

export const brandImageFileName = (brandName: string): string => {
  const key = brandName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip combining diacritical marks: "é" -> "e"
  return `${key}.webp`;
};
