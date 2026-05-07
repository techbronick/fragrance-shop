import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '@/i18n';

const SITE_BASE_URL = 'https://modestshop.md';
const SITE_NAME = 'ModestShop';

const OG_LOCALE: Record<string, string> = {
  ro: 'ro_MD',
  ru: 'ru_RU',
  en: 'en_US',
};

interface PageMetaProps {
  titleKey: string;
  descriptionKey: string;
  namespace: string;
  values?: Record<string, string | number>;
}

function stripLang(pathname: string): string {
  const stripped = pathname.replace(/^\/[^/]+/, '');
  return stripped || '/';
}

export function PageMeta({ titleKey, descriptionKey, namespace, values }: PageMetaProps) {
  const { t, i18n } = useTranslation(namespace);
  const location = useLocation();
  const lang = i18n.language;
  const pathnameLangless = stripLang(location.pathname);

  const title = t(titleKey, values ?? {});
  const description = t(descriptionKey, values ?? {});
  const canonical = `${SITE_BASE_URL}/${lang}${pathnameLangless}`;

  return (
    <Helmet>
      <title>{`${title} · ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} · ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={OG_LOCALE[lang] ?? OG_LOCALE[DEFAULT_LANG]} />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
      {SUPPORTED_LANGS.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${SITE_BASE_URL}/${l}${pathnameLangless}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_BASE_URL}/${DEFAULT_LANG}${pathnameLangless}`}
      />
    </Helmet>
  );
}
