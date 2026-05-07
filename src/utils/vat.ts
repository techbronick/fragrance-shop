// EU VAT data and pure math. All copy lives here so sub-project A (i18n)
// has a single swap point.

export type EuCountryCode =
  | 'AT' | 'BE' | 'BG' | 'CY' | 'CZ' | 'DE' | 'DK' | 'EE' | 'ES' | 'FI'
  | 'FR' | 'GR' | 'HR' | 'HU' | 'IE' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT'
  | 'NL' | 'PL' | 'PT' | 'RO' | 'SE' | 'SI' | 'SK';

// Standard VAT rates as of 2026. Verify before deploy. Update when rates change.
export const EU_VAT_RATES: Record<EuCountryCode, number> = {
  AT: 0.20, BE: 0.21, BG: 0.20, CY: 0.19, CZ: 0.21, DE: 0.19, DK: 0.25,
  EE: 0.22, ES: 0.21, FI: 0.255, FR: 0.20, GR: 0.24, HR: 0.25, HU: 0.27,
  IE: 0.23, IT: 0.22, LT: 0.21, LU: 0.17, LV: 0.21, MT: 0.18, NL: 0.21,
  PL: 0.23, PT: 0.23, RO: 0.19, SE: 0.25, SI: 0.22, SK: 0.23,
};

// Romanian labels for the checkout country dropdown.
export const EU_COUNTRY_LABELS: Record<EuCountryCode, string> = {
  AT: 'Austria',     BE: 'Belgia',    BG: 'Bulgaria',   CY: 'Cipru',
  CZ: 'Cehia',       DE: 'Germania',  DK: 'Danemarca',  EE: 'Estonia',
  ES: 'Spania',      FI: 'Finlanda',  FR: 'Franța',     GR: 'Grecia',
  HR: 'Croația',     HU: 'Ungaria',   IE: 'Irlanda',    IT: 'Italia',
  LT: 'Lituania',    LU: 'Luxemburg', LV: 'Letonia',    MT: 'Malta',
  NL: 'Olanda',      PL: 'Polonia',   PT: 'Portugalia', RO: 'România',
  SE: 'Suedia',      SI: 'Slovenia',  SK: 'Slovacia',
};

/** VAT amount in bani. Returns 0 for MD or any non-EU-27 country. */
export function calculateVatBani(subtotalBani: number, country: string): number {
  const rate = EU_VAT_RATES[country as EuCountryCode];
  if (rate === undefined) return 0;
  return Math.round(subtotalBani * rate);
}

/** VAT rate as a decimal (e.g. 0.19) or null if not an EU-27 country. */
export function getVatRate(country: string): number | null {
  return EU_VAT_RATES[country as EuCountryCode] ?? null;
}
