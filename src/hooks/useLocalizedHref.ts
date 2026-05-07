import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANG, isSupportedLang } from '@/i18n';

export function useLocalizedHref() {
  const { i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : DEFAULT_LANG;
  return useCallback(
    (path: string) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `/${lang}${normalized}`;
    },
    [lang],
  );
}
