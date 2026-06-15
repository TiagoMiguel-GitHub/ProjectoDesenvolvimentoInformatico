// Contexto global do carrinho de compras.
// Persiste os itens no AsyncStorage para sobreviver ao fecho da app.
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, Product } from "../types";

// Chave usada para guardar e recuperar o carrinho no armazenamento local do dispositivo
const CART_KEY = "@agrowood_cart";

// Contrato do contexto: lista de itens, operações CRUD e valores calculados
interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: number;      // soma do preço × quantidade de todos os itens
  itemCount: number;  // total de unidades no carrinho (usado no badge do tab)
}

const CartContext = createContext<CartContextValue>(null!);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Restaura o carrinho guardado quando a app abre
  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((raw) => {
      if (raw) setItems(JSON.parse(raw));
    });
  }, []);

  // Adiciona um produto ou aumenta a quantidade se já existir.
  // Nunca ultrapassa o stock disponível.
  function addItem(product: Product, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const newQty = existing
        ? Math.min(existing.quantity + quantity, product.stock_quantity)
        : Math.min(quantity, product.stock_quantity);
      const next = existing
        ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: newQty } : i)
        : [...prev, { product, quantity: newQty }];
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next)); // persiste imediatamente
      return next;
    });
  }

  // Atualiza a quantidade de um item; remove-o se a quantidade for 0 ou negativa
  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      const capped = item ? Math.min(quantity, item.product.stock_quantity) : quantity;
      const next = capped <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => i.product.id === productId ? { ...i, quantity: capped } : i);
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

  // Limpa o carrinho após encomenda concluída
  function clear() {
    setItems([]);
    AsyncStorage.removeItem(CART_KEY);
  }

  // Valores calculados derivados da lista de itens
  const total = items.reduce((sum, i) => sum + Number(i.product.price_per_unit) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
