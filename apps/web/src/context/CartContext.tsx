// Contexto do carrinho de compras para o website.
// Diferente da app mobile, o estado não é persistido (sem AsyncStorage no browser)
// — o carrinho é reiniciado a cada visita, o que é o comportamento padrão de lojas web.
import React, { createContext, useContext, useState } from "react";
import type { CartItem, Product } from "../types";

interface CartContextType {
  items: CartItem[];
  itemCount: number; // total de unidades (usado no badge da navbar)
  total: number;     // valor total sem custo de entrega
  addItem: (product: Product, quantity: number) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Valores calculados derivados da lista de itens — recalculados em cada renderização
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.product.price_per_unit * i.quantity, 0);

  // Adiciona um produto; se já existir no carrinho, incrementa a quantidade
  function addItem(product: Product, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  }

  // Atualiza a quantidade; remove o item se a quantidade for 0 ou negativa
  function updateItem(productId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  // Esvazia o carrinho após checkout concluído
  function clear() { setItems([]); }

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
