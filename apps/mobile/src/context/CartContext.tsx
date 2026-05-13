import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, Product } from "../types";

const CART_KEY = "@agrowood_cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue>(null!);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((raw) => {
      if (raw) setItems(JSON.parse(raw));
    });
  }, []);

  function addItem(product: Product, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const next = existing
        ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { product, quantity }];
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => i.product.id === productId ? { ...i, quantity } : i);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clear() {
    setItems([]);
    AsyncStorage.removeItem(CART_KEY);
  }

  const total = items.reduce((sum, i) => sum + Number(i.product.price_per_unit) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
