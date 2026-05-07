import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShippingAddress } from "@/types/checkout";
import { getLocalizedCountryOptions } from "@/utils/countries";

type Errors = Partial<Record<keyof ShippingAddress, string>>;

type Props = {
  shippingAddress: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  errors: Errors;
  touched: Partial<Record<keyof ShippingAddress, boolean>>;
  onBlur: (field: keyof ShippingAddress) => void;
  submitted: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  cartIsEmpty: boolean;
};

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={`field-${name}`} className="space-y-1.5">
      <label className="text-caption text-text-muted">{label}</label>
      {children}
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}
    </div>
  );
}

export function CheckoutForm({
  shippingAddress,
  onChange,
  errors,
  touched,
  onBlur,
  submitted,
  onSubmit,
  isSubmitting,
  cartIsEmpty,
}: Props) {
  const { t: tc } = useTranslation("checkout");
  const { t } = useTranslation("common");

  const countryOptions = getLocalizedCountryOptions(t);

  const errorFor = (field: keyof ShippingAddress): string | undefined => {
    const err = errors[field];
    if (!err) return undefined;
    if (touched[field] || submitted) return err;
    return undefined;
  };

  const updateField = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...shippingAddress, [field]: value });
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Contact */}
      <section className="space-y-4">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
          {tc('form.sectionContact')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="email" label={tc('form.email')} error={errorFor('email')}>
            <Input
              type="email"
              value={shippingAddress.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => onBlur('email')}
              autoComplete="email"
            />
          </Field>
          <Field name="phone" label={tc('form.phone')} error={errorFor('phone')}>
            <Input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => onBlur('phone')}
              autoComplete="tel"
            />
          </Field>
        </div>
      </section>

      {/* Shipping address */}
      <section className="space-y-4">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
          {tc('form.sectionShipping')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="firstName" label={tc('form.firstName')} error={errorFor('firstName')}>
            <Input
              value={shippingAddress.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              onBlur={() => onBlur('firstName')}
              autoComplete="given-name"
            />
          </Field>
          <Field name="lastName" label={tc('form.lastName')} error={errorFor('lastName')}>
            <Input
              value={shippingAddress.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              onBlur={() => onBlur('lastName')}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field name="country" label={tc('form.country')}>
          <Select
            value={shippingAddress.country}
            onValueChange={(v) => updateField('country', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map(({ code, label }) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field name="address" label={tc('form.address')} error={errorFor('address')}>
          <Input
            value={shippingAddress.address}
            onChange={(e) => updateField('address', e.target.value)}
            onBlur={() => onBlur('address')}
            autoComplete="street-address"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="city" label={tc('form.city')} error={errorFor('city')}>
            <Input
              value={shippingAddress.city}
              onChange={(e) => updateField('city', e.target.value)}
              onBlur={() => onBlur('city')}
              autoComplete="address-level2"
            />
          </Field>
          <Field name="postalCode" label={tc('form.postalCode')} error={errorFor('postalCode')}>
            <Input
              value={shippingAddress.postalCode ?? ''}
              onChange={(e) => updateField('postalCode', e.target.value)}
              onBlur={() => onBlur('postalCode')}
              autoComplete="postal-code"
            />
          </Field>
        </div>
      </section>

      {/* Submit (desktop only) */}
      <Button
        variant="primary"
        size="lg"
        className="hidden lg:flex w-full"
        type="submit"
        disabled={isSubmitting || cartIsEmpty}
      >
        {isSubmitting ? tc('submitting') : tc('submit')}
      </Button>
    </form>
  );
}
