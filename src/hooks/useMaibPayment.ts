import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Client side of the maib Checkout integration. The keys live in the Vercel
// Functions under /api/maib; the browser only ever sees the hosted checkout URL.

export type MaibPaymentStatus = 'none' | 'pending' | 'paid' | 'failed' | 'refunded';

export class MaibRequestError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

async function post<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new MaibRequestError(data?.error || `http_${res.status}`);
  return data as T;
}

/** Registers a maib checkout for the order and sends the browser to it. */
export async function redirectToMaibCheckout(orderId: string, language: string): Promise<void> {
  const { checkoutUrl } = await post<{ checkoutUrl: string }>('/api/maib/create', { orderId, language });
  window.location.assign(checkoutUrl);
}

/** Polls the payment state while it's pending (the callback can lag the redirect). */
export function useMaibPaymentStatus(orderId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['maib-status', orderId],
    queryFn: async (): Promise<MaibPaymentStatus> => {
      const res = await fetch(`/api/maib/status?orderId=${encodeURIComponent(orderId!)}`);
      if (!res.ok) throw new Error(`status_${res.status}`);
      return (await res.json()).status as MaibPaymentStatus;
    },
    enabled: enabled && !!orderId,
    refetchInterval: (query) => (query.state.data === 'pending' ? 3000 : false),
    refetchIntervalInBackground: false,
  });
}

export function useMaibRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new MaibRequestError('not_signed_in');
      return post<{ refundId: string; status: string }>(
        '/api/maib/refund',
        { orderId, reason },
        { Authorization: `Bearer ${token}` },
      );
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['maib-status', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
