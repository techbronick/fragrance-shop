import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type SupportedLang } from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant: 'header' | 'footer';
  className?: string;
}

export function LanguageSwitcher({ variant, className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const current = i18n.language as SupportedLang;

  const handleSwitch = (lang: SupportedLang) => {
    if (lang === current) return;
    const rest = location.pathname.replace(/^\/[^/]+/, '');
    const target = `/${lang}${rest}${location.search}${location.hash}`;
    navigate(target);
  };

  const sizeClass = variant === 'header' ? 'text-caption' : 'text-body';

  return (
    <div
      role="group"
      aria-label={t('languageSwitcher.label')}
      className={cn('flex items-center gap-2', className)}
    >
      {SUPPORTED_LANGS.map((lang, idx) => (
        <span key={lang} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSwitch(lang)}
            className={cn(
              sizeClass,
              'transition-colors duration-quick ease-default',
              lang === current
                ? 'text-text-strong font-medium'
                : 'text-text-muted hover:text-text',
            )}
            aria-current={lang === current ? true : undefined}
          >
            {t(`languageSwitcher.${lang}`)}
          </button>
          {idx < SUPPORTED_LANGS.length - 1 && (
            <span className="text-text-faint" aria-hidden="true">·</span>
          )}
        </span>
      ))}
    </div>
  );
}
