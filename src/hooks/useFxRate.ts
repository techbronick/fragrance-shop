import { useQuery } from '@tanstack/react-query';

// Used when the live FX call fails. Approximate, not authoritative.
const MDL_PER_EUR_FALLBACK = 19.5;

/**
 * MDL per 1 EUR. Cached for 24h. On any failure, returns the hardcoded fallback.
 * `isLive` is true when the value comes from the API; false when it's the fallback.
 */
export function useFxRate(): { mdlPerEur: number; isLive: boolean } {
  const { data, isError } = useQuery({
    queryKey: ['fx-mdl-eur'],
    queryFn: async (): Promise<number> => {
      const res = await fetch(
        'https://api.exchangerate.host/latest?base=EUR&symbols=MDL',
      );
      const json = await res.json();
      const rate = json?.rates?.MDL;
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error('Invalid FX response');
      }
      return rate;
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    mdlPerEur: data ?? MDL_PER_EUR_FALLBACK,
    isLive: !isError && typeof data === 'number',
  };
}
