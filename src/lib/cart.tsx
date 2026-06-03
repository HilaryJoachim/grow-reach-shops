import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { lineTotal, unitPriceFor, savingsFor } from "./pricing";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  retail_price: number;
  wholesale_price: number;
  moq: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  totalSavings: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "afrogrow_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const value: CartCtx = useMemo(() => ({
    items,
    add: (item, qty = 1) => setItems((prev) => {
      const i = prev.findIndex((x) => x.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    }),
    setQty: (id, qty) => setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x))
    ),
    remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
    clear: () => setItems([]),
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + lineTotal(i, i.qty), 0),
    totalSavings: items.reduce((s, i) => s + savingsFor(i, i.qty), 0),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside provider");
  return v;
}

export { unitPriceFor };
