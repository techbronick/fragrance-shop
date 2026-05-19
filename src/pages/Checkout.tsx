import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { useFxRate } from "@/hooks/useFxRate";
import { calculateVatBani } from "@/utils/vat";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { MobileSubmitBar } from "@/components/checkout/MobileSubmitBar";
import {
  ShippingAddress,
  DEFAULT_SHIPPING_ADDRESS,
} from "@/types/checkout";
import { CreateOrderInput } from "@/types/orders";

const STORAGE_KEY = 'checkout_shipping_v1';
const TAX_RATE = 0.15;

// Shipping policy: free inside Chișinău (city limits), confirmed by the
// shop on WhatsApp for any other address (incl. international). The total
// shown reflects subtotal + VAT only; the actual shipping cost is added
// during WhatsApp confirmation, in line with the offsite payment model.
export type ShippingMode = 'free' | 'tbd';

function isInChisinau(city: string): boolean {
  const norm = (city || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  return ['chisinau', 'kishinev', 'кишинев', 'кишинёв']
    .map((n) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))
    .includes(norm);
}

function loadSavedAddress(): ShippingAddress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SHIPPING_ADDRESS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load saved address:', error);
  }
  return DEFAULT_SHIPPING_ADDRESS;
}

type Errors = Partial<Record<keyof ShippingAddress, string>>;

function validate(addr: ShippingAddress, tc: TFunction): Errors {
  const errors: Errors = {};
  if (!addr.email) errors.email = tc('validation.emailRequired');
  else if (!/^\S+@\S+\.\S+$/.test(addr.email)) errors.email = tc('validation.emailInvalid');

  if (!addr.phone) errors.phone = tc('validation.phoneRequired');
  else if (addr.phone.replace(/\D/g, '').length < 7) errors.phone = tc('validation.phoneInvalid');

  if (!addr.firstName.trim()) errors.firstName = tc('validation.firstNameRequired');
  if (!addr.lastName.trim()) errors.lastName = tc('validation.lastNameRequired');
  if (!addr.address.trim()) errors.address = tc('validation.addressRequired');
  if (!addr.city.trim()) errors.city = tc('validation.cityRequired');

  if (addr.country !== 'MD' && (addr.postalCode || '').trim().length < 3) {
    errors.postalCode = tc('validation.postalCodeRequired');
  }

  return errors;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("checkout");
  const href = useLocalizedHref();
  const { items, clearCart } = useCart();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { toast } = useToast();
  const { mdlPerEur } = useFxRate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(loadSavedAddress);
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Auto-save on every change (silent: no checkbox per Q1)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shippingAddress));
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  }, [shippingAddress]);

  const errors = useMemo(() => validate(shippingAddress, tc), [shippingAddress, tc]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * 100 * item.quantity,
      0,
    );
    const country = shippingAddress.country;
    // In-Chișinău orders ship free; everything else is "calculated at
    // confirmation" (the shop adjusts the final amount on WhatsApp).
    const shippingMode: ShippingMode =
      country === 'MD' && isInChisinau(shippingAddress.city) ? 'free' : 'tbd';
    const shipping = 0;
    const vat = calculateVatBani(subtotal, country);
    const total = subtotal + shipping + vat;
    const taxIncluded = country === 'MD'
      ? Math.round(total * (TAX_RATE / (1 + TAX_RATE)))
      : 0;
    return { subtotal, shipping, vat, total, taxIncluded, shippingMode };
  }, [items, shippingAddress.country, shippingAddress.city]);

  const onBlur = (field: keyof ShippingAddress) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const fieldsWithErrors = Object.keys(errors).filter(
      (k) => errors[k as keyof Errors],
    );

    if (fieldsWithErrors.length > 0) {
      const firstField = fieldsWithErrors[0];
      const target = document.getElementById(`field-${firstField}`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }

    if (items.length === 0) return;

    const orderInput: CreateOrderInput = {
      customer_email: shippingAddress.email,
      customer_phone: shippingAddress.phone,
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      shipping_address: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      shipping_method_id: 'standard',
      newsletter_opt_in: false,
    };

    createOrder(
      {
        input: orderInput,
        cartItems: items,
        shippingCost: totals.shipping,
        vatCost: totals.vat,
      },
      {
        onSuccess: (order) => {
          clearCart();
          toast({ title: t('toast.orderPlaced') });
          navigate(href(`/orders/${order.id}?placed=1`));
        },
        onError: (err: unknown) => {
          console.error('Order creation failed:', err);
          toast({
            title: t('toast.orderFailed'),
            description: t('toast.errorGeneric'),
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="checkout"
        titleKey="meta.title"
        descriptionKey="meta.description"
      />
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-12">
            {tc('title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <CheckoutForm
                shippingAddress={shippingAddress}
                onChange={setShippingAddress}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
                submitted={submitted}
                onSubmit={handleSubmit}
                isSubmitting={isCreatingOrder}
                cartIsEmpty={items.length === 0}
              />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start order-first lg:order-none">
              <OrderSummary
                items={items}
                totals={totals}
                country={shippingAddress.country}
                mdlPerEur={mdlPerEur}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <MobileSubmitBar
        total={totals.total}
        country={shippingAddress.country}
        mdlPerEur={mdlPerEur}
        onSubmit={handleSubmit}
        isSubmitting={isCreatingOrder}
        itemCount={items.length}
      />
    </div>
  );
};

export default Checkout;
