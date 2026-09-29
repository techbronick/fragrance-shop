import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { redirectToMaibCheckout, useMaibPaymentStatus } from "@/hooks/useMaibPayment";

type Props = {
  orderId: string;
  orderStatus: string;
};

/** Payment state for card (maib) orders, with a retry when the payment didn't go through. */
export function PaymentStatusPanel({ orderId, orderStatus }: Props) {
  const { t, i18n } = useTranslation("order");
  const { toast } = useToast();
  const [retrying, setRetrying] = useState(false);
  const { data: status, isLoading } = useMaibPaymentStatus(orderId, true);

  const retry = async () => {
    setRetrying(true);
    try {
      await redirectToMaibCheckout(orderId, i18n.language);
    } catch {
      setRetrying(false);
      toast({ title: t('payment.retryFailed'), variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-caption text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> {t('payment.checking')}
      </div>
    );
  }

  const effective = status === 'paid' || orderStatus === 'paid'
    ? 'paid'
    : status === 'refunded' || orderStatus === 'refunded'
      ? 'refunded'
      : status;

  if (effective === 'paid' || effective === 'refunded') {
    return (
      <div className="flex items-center justify-center gap-2 text-body text-text-strong">
        <CheckCircle2 className="h-5 w-5 text-success" />
        {t(effective === 'paid' ? 'payment.paid' : 'payment.refunded')}
      </div>
    );
  }

  if (effective === 'pending') {
    return (
      <div className="flex items-center justify-center gap-2 text-caption text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> {t('payment.pending')}
      </div>
    );
  }

  // 'failed', 'none' (payment never started) or an unreachable status endpoint
  const payable = ['pending', 'placed'].includes(orderStatus);
  return (
    <div className="space-y-4 text-center">
      <p className="flex items-center justify-center gap-2 text-body text-text-strong">
        <XCircle className="h-5 w-5 text-error" />
        {t(effective === 'failed' ? 'payment.failed' : 'payment.notPaid')}
      </p>
      {payable && (
        <Button variant="primary" size="md" onClick={retry} disabled={retrying}>
          {retrying ? t('payment.redirecting') : t('payment.retry')}
        </Button>
      )}
    </div>
  );
}
