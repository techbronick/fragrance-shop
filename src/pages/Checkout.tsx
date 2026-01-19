import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Lock, ShoppingBag } from "lucide-react";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { CreateOrderInput, Order } from "@/types/orders";
import { 
  ShippingAddress, 
  CheckoutState, 
  DEFAULT_SHIPPING_ADDRESS, 
  AVAILABLE_SHIPPING_METHODS 
} from "@/types/checkout";



const STORAGE_KEY = 'checkout_shipping_v1';

// Tax rate for Moldova (you can adjust this)
const TAX_RATE = 0.15; // 15%

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  // În componenta Checkout:
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { toast } = useToast();
  
  // Load saved address from localStorage
  const loadSavedAddress = (): ShippingAddress => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SHIPPING_ADDRESS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load saved address:', error);
    }
    return DEFAULT_SHIPPING_ADDRESS;
  };

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    shippingAddress: loadSavedAddress(),
    shippingMethod: AVAILABLE_SHIPPING_METHODS[0],
    newsletterOptIn: false,
    saveInfo: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({});
  
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      navigate('/shop');
    }
  }, [items, navigate, orderCompleted]);


  // Save to localStorage if saveInfo is checked
  useEffect(() => {
    if (checkoutState.saveInfo) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutState.shippingAddress));
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }
  }, [checkoutState.saveInfo, checkoutState.shippingAddress]);

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.price * 100; // Convert Lei to bani
      return sum + (itemPrice * item.quantity);
    }, 0);

    const shipping = checkoutState.shippingMethod.price;
    const total = subtotal + shipping;
    const taxIncluded = Math.round(total * (TAX_RATE / (1 + TAX_RATE)));

    return {
      subtotal,
      shipping,
      total,
      taxIncluded
    };
  };

  const totals = calculateTotals();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return 'E-mail este obligatoriu';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'E-mail invalid';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Telefon este obligatoriu';
    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
    if (!phoneRegex.test(phone)) return 'Număr de telefon invalid';
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} este obligatoriu`;
    }
    return null;
  };

  // Handle field change
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setCheckoutState(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));

    // Validate on change if already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof ShippingAddress) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, checkoutState.shippingAddress[field]);
  };

  // Validate single field
  const validateField = (field: keyof ShippingAddress, value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'firstName':
        error = validateRequired(value, 'Prenume');
        break;
      case 'lastName':
        error = validateRequired(value, 'Nume de familie');
        break;
      case 'address':
        error = validateRequired(value, 'Adresă');
        break;
      case 'city':
        error = validateRequired(value, 'Localitate');
        break;
      case 'postalCode':
        // Optional field, no validation
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const requiredFields: (keyof ShippingAddress)[] = [
      'email', 'firstName', 'lastName', 'address', 'city', 'phone'
    ];

    let isValid = true;
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    requiredFields.forEach(field => {
      const value = checkoutState.shippingAddress[field];
      let error: string | null = null;

      if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'phone') {
        error = validatePhone(value);
      } else {
        error = validateRequired(value, field);
      }

      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
  
    const orderInput: CreateOrderInput = {
      customer_email: checkoutState.shippingAddress.email,
      customer_phone: checkoutState.shippingAddress.phone,
      customer_name: `${checkoutState.shippingAddress.firstName} ${checkoutState.shippingAddress.lastName}`,
      shipping_address: {
        firstName: checkoutState.shippingAddress.firstName,
        lastName: checkoutState.shippingAddress.lastName,
        address: checkoutState.shippingAddress.address,
        city: checkoutState.shippingAddress.city,
        postalCode: checkoutState.shippingAddress.postalCode,
        country: checkoutState.shippingAddress.country,
        phone: checkoutState.shippingAddress.phone
      },
      shipping_method_id: checkoutState.shippingMethod.id,
      newsletter_opt_in: checkoutState.newsletterOptIn
    };
  
    createOrder({
      input: orderInput,
      cartItems: items,
      shippingCost: checkoutState.shippingMethod.price
    }, {
      onSuccess: (order) => {
        setOrderCompleted(true); // Set flag before clearing cart
        clearCart();
        toast({
          title: "Comandă plasată cu succes!",
          description: `Comanda #${order.id.slice(0, 8)} a fost creată.`
        });
        navigate(`/orders/${order.id}`);
      },
      onError: (error) => {
        toast({
          title: "Eroare",
          description: "Nu am putut plasa comanda. Te rugăm să încerci din nou.",
          variant: "destructive"
        });
        console.error('Order creation error:', error);
      }
    });
  };


  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Form (60%) */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Section */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={checkoutState.shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={errors.email && touched.email ? 'border-red-500' : ''}
                      placeholder="exemplu@email.com"
                    />
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={checkoutState.newsletterOptIn}
                      onCheckedChange={(checked) =>
                        setCheckoutState(prev => ({ ...prev, newsletterOptIn: checked === true }))
                      }
                    />
                    <label
                      htmlFor="newsletter"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Doresc să primesc e-mailuri cu noutăți și oferte
                    </label>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Delivery Section */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Livrare</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country">Țară/Regiune</Label>
                    <Select
                      value={checkoutState.shippingAddress.country}
                      onValueChange={(value) => handleAddressChange('country', value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Selectează țara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MD">Republica Moldova</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prenume</Label>
                      <Input
                        id="firstName"
                        value={checkoutState.shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && touched.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Nume de familie</Label>
                      <Input
                        id="lastName"
                        value={checkoutState.shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && touched.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Adresă</Label>
                    <Input
                      id="address"
                      value={checkoutState.shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      className={errors.address && touched.address ? 'border-red-500' : ''}
                    />
                    {errors.address && touched.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Cod poștal (opțional)</Label>
                    <Input
                      id="postalCode"
                      value={checkoutState.shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Localitate</Label>
                    <Input
                      id="city"
                      value={checkoutState.shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      className={errors.city && touched.city ? 'border-red-500' : ''}
                    />
                    {errors.city && touched.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={checkoutState.shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={errors.phone && touched.phone ? 'border-red-500' : ''}
                      placeholder="+373 XX XXX XXX"
                    />
                    {errors.phone && touched.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveInfo"
                      checked={checkoutState.saveInfo}
                      onCheckedChange={(checked) =>
                        setCheckoutState(prev => ({ ...prev, saveInfo: checked === true }))
                      }
                    />
                    <label
                      htmlFor="saveInfo"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Salvează aceste informații pentru data viitoare
                    </label>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Shipping Method Section */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Metodă de expediere</h2>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary"></div>
                        <span className="font-medium">{checkoutState.shippingMethod.name}</span>
                      </div>
                      <span className="font-semibold">
                        {formatCheckoutPrice(checkoutState.shippingMethod.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <Separator />

              {/* Payment Section */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Plată</h2>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Toate tranzacțiile sunt securizate și criptate.
                </p>

                <Alert className="bg-muted border-muted-foreground/20">
                  <AlertDescription className="text-center py-4">
                    Momentan, acest magazin nu poate accepta plăți.
                  </AlertDescription>
                </Alert>

                <Button 
  type="submit" 
  className="w-full" 
  size="lg"
  disabled={isCreatingOrder || items.length === 0}
  onClick={handleSubmit}
>
  {isCreatingOrder ? 'Se procesează...' : 'Finalizează Comanda'}
</Button>
              </section>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <a href="/refund-policy" className="hover:text-primary transition-colors">
                  Politica de rambursare
                </a>
                <span>·</span>
                <a href="/privacy" className="hover:text-primary transition-colors">
                  Politica de confidențialitate
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (40%) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Rezumat comandă</h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item, index) => (
                      <div key={`${item.id}-${item.skuId || index}`} className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-md border overflow-hidden bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <Badge
                            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full p-0 bg-foreground text-background"
                          >
                            {item.quantity}
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight mb-1">
                            {item.name}
                          </p>
                          {item.brand && (
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                          )}
                          {item.sizeLabel && (
                            <p className="text-xs text-muted-foreground">{item.sizeLabel}</p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          {item.price === 0 ? (
                            <span className="font-semibold text-sm text-green-600">GRATUIT</span>
                          ) : (
                            <span className="font-semibold text-sm">
                              {formatCheckoutPrice(item.price * item.quantity * 100)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Subtotal · {totalItems} {totalItems === 1 ? 'articol' : 'articole'}
                    </span>
                    <span className="font-medium">
                      {formatCheckoutPrice(totals.subtotal)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Transport
                      <Info className="h-3 w-3" />
                    </span>
                    <span className="font-medium">
                      {formatCheckoutPrice(totals.shipping)}
                    </span>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-lg font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">MDL</div>
                      <div className="text-2xl font-bold">
                        {formatCheckoutPrice(totals.total)}
                      </div>
                    </div>
                  </div>

                  {/* Tax Included */}
                  <p className="text-xs text-muted-foreground text-right">
                    Inclusiv {formatCheckoutPrice(totals.taxIncluded)} din taxe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;