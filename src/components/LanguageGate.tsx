import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANG, isSupportedLang } from '@/i18n';

export function LanguageGate() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const { i18n } = useTranslation();

  const valid = isSupportedLang(lang);

  useEffect(() => {
    if (!valid) return;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang, valid, i18n]);

  if (!valid) {
    const rest = location.pathname.replace(/^\/[^/]+/, '');
    const target = `/${DEFAULT_LANG}${rest}${location.search}${location.hash}`;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
