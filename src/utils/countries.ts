import type { TFunction } from 'i18next';
import { EU_VAT_RATES, type EuCountryCode } from './vat';

/** Moldova is not in the EU but is the default shipping destination. */
const MD_ENTRY = { code: 'MD', vatRate: 0 } as const;

export function getCountryLabel(code: string, t: TFunction): string {
  const key = `countries.${code}`;
  const translated = t(key, { ns: 'common' });
  return translated === key ? code : translated;
}

export function getLocalizedCountryOptions(t: TFunction) {
  const euOptions = (Object.keys(EU_VAT_RATES) as EuCountryCode[]).map((code) => ({
    code,
    label: getCountryLabel(code, t),
    vatRate: EU_VAT_RATES[code],
  }));

  const sorted = euOptions.sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  // Moldova first — it's the default and most common destination
  const mdOption = {
    code: MD_ENTRY.code,
    label: getCountryLabel(MD_ENTRY.code, t),
    vatRate: MD_ENTRY.vatRate,
  };

  return [mdOption, ...sorted];
}
