export interface ShippingAddress {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    postalCode?: string;
    city: string;
    phone: string;
    country: string;
  }
  
  export interface ShippingMethod {
    id: string;
    name: string;
    price: number; // in bani
  }
  
  export interface CheckoutState {
    shippingAddress: ShippingAddress;
    shippingMethod: ShippingMethod;
    newsletterOptIn: boolean;
    saveInfo: boolean;
  }
  
  export const DEFAULT_SHIPPING_ADDRESS: ShippingAddress = {
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    country: 'MD'
  };
  
  export const AVAILABLE_SHIPPING_METHODS: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Livrare',
      price: 5000 // 50.00 Lei in bani
    }
  ];