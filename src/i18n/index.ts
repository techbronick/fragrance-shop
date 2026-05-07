import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import roCommon from './locales/ro/common.json';
import ruCommon from './locales/ru/common.json';
import enCommon from './locales/en/common.json';

import roHome from './locales/ro/home.json';
import ruHome from './locales/ru/home.json';
import enHome from './locales/en/home.json';

import roShop from './locales/ro/shop.json';
import ruShop from './locales/ru/shop.json';
import enShop from './locales/en/shop.json';

import roProduct from './locales/ro/product.json';
import ruProduct from './locales/ru/product.json';
import enProduct from './locales/en/product.json';

import roDiscovery from './locales/ro/discovery.json';
import ruDiscovery from './locales/ru/discovery.json';
import enDiscovery from './locales/en/discovery.json';

import roCheckout from './locales/ro/checkout.json';
import ruCheckout from './locales/ru/checkout.json';
import enCheckout from './locales/en/checkout.json';

import roOrder from './locales/ro/order.json';
import ruOrder from './locales/ru/order.json';
import enOrder from './locales/en/order.json';

import roStatic from './locales/ro/static.json';
import ruStatic from './locales/ru/static.json';
import enStatic from './locales/en/static.json';

export const SUPPORTED_LANGS = ['ro', 'ru', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: SupportedLang = 'ro';

export function isSupportedLang(value: string | undefined): value is SupportedLang {
  return value !== undefined && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

i18n.use(initReactI18next).init({
  resources: {
    ro: { common: roCommon, home: roHome, shop: roShop, product: roProduct, discovery: roDiscovery, checkout: roCheckout, order: roOrder, static: roStatic },
    ru: { common: ruCommon, home: ruHome, shop: ruShop, product: ruProduct, discovery: ruDiscovery, checkout: ruCheckout, order: ruOrder, static: ruStatic },
    en: { common: enCommon, home: enHome, shop: enShop, product: enProduct, discovery: enDiscovery, checkout: enCheckout, order: enOrder, static: enStatic },
  },
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  defaultNS: 'common',
  ns: ['common', 'home', 'shop', 'product', 'discovery', 'checkout', 'order', 'static'],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

if (typeof window !== 'undefined') {
  const pathLang = window.location.pathname.split('/')[1];
  if (isSupportedLang(pathLang)) {
    i18n.changeLanguage(pathLang);
    document.documentElement.lang = pathLang;
  } else {
    document.documentElement.lang = DEFAULT_LANG;
  }
}

export default i18n;
