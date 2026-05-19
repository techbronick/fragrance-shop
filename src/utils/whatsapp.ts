// Centralised WhatsApp config. One source of truth so every CTA, chat
// bubble, and inline link uses the same number and link format.
//
// Phone number is intentionally hard-coded (not env) because it's the
// public contact, not a secret: same as the tel: link on /contact.

export const WHATSAPP_NUMBER = "37360123456";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
