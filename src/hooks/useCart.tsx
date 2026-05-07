import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  type: 'product' | 'predefined-bundle' | 'custom-bundle';
  name: string;
  quantity: number;
  price: number;  // in Lei (not bani)
  sizeLabel?: string;
  image?: string;
  brand?: string;
  
  // For SKU items
  skuId?: string;
  
  // For bundles
  configId?: string;
  selectedItems?: Array<{ slot_index: number; sku_id: string }>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, skuId?: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, skuId: string | undefined, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);



export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      // If item with same id/sku exists, increase quantity
      const idx = prev.findIndex(
        i => i.id === item.id && i.skuId === item.skuId && i.type === item.type
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string, skuId?: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.skuId === skuId)));
  };

  const clearCart = () => setItems([]);

  const updateQuantity = (id: string, skuId: string | undefined, quantity: number) => {
    setItems(prev => prev.map(i =>
      i.id === id && i.skuId === skuId ? { ...i, quantity } : i
    ));
  };


  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};



export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}; 

