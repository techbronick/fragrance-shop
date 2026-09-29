import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMaibRefund } from '@/hooks/useMaibPayment';
import { formatPrice } from '@/utils/formatPrice';
import { CreditCard, RotateCcw } from 'lucide-react';

/** Online (maib) payment details + full refund, for card orders. */
export function MaibPaymentCard({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const refund = useMaibRefund();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const latest = payments[0];

  const onRefund = () => {
    if (!latest) return;
    const reason = prompt('Refund reason (sent to maib):', 'Rambursare comandă');
    if (reason === null) return;
    refund.mutate(
      { orderId, reason },
      {
        onSuccess: (res) => {
          toast({ title: 'Refund created', description: `maib refund ${res.refundId} (${res.status})` });
          queryClient.invalidateQueries({ queryKey: ['admin-payments', orderId] });
          queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
        },
        onError: (err) => {
          toast({ title: 'Refund failed', description: err.message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Online payment (maib)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !latest ? (
          <p className="text-muted-foreground">The customer has not started a payment yet.</p>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={latest.status === 'paid' ? 'default' : 'outline'}>{latest.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatPrice(latest.amount_bani)} {latest.currency}</span>
            </div>
            {latest.payment_id && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-xs break-all text-right">{latest.payment_id}</span>
              </div>
            )}
            {latest.refund_id && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Refund ID</span>
                <span className="font-mono text-xs break-all text-right">{latest.refund_id}</span>
              </div>
            )}
            {payments.length > 1 && (
              <p className="text-muted-foreground">{payments.length} checkout attempts</p>
            )}
            {latest.status === 'paid' && (
              <Button
                className="w-full"
                variant="destructive"
                onClick={onRefund}
                disabled={refund.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {refund.isPending ? 'Refunding…' : 'Refund full amount'}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
