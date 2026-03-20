import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  size?: string;
  crust?: string;
  addons: string[];
  quantity: number;
  unitPrice: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const normalizeAddons = (addons: string[]) => [...addons].sort();

const isSameConfiguration = (
  existing: CartItem,
  incoming: Omit<CartItem, "id">,
) => {
  return (
    existing.productId === incoming.productId &&
    (existing.size || "") === (incoming.size || "") &&
    (existing.crust || "") === (incoming.crust || "") &&
    normalizeAddons(existing.addons).join(",") ===
      normalizeAddons(incoming.addons).join(",")
  );
};

const buildItemId = (item: Omit<CartItem, "id">) => {
  const addonsKey = normalizeAddons(item.addons).join(",") || "no-addons";
  const sizeKey = item.size || "default";
  const crustKey = item.crust || "default";
  return `${item.productId}-${sizeKey}-${crustKey}-${addonsKey}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const quantity = Math.max(1, item.quantity);
          const normalizedItem = {
            ...item,
            quantity,
            addons: normalizeAddons(item.addons),
          };
          const existing = state.items.find((i) => isSameConfiguration(i, normalizedItem));

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...normalizedItem,
                id: buildItemId(normalizedItem),
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    }),
    { name: "pizza-cart" }
  )
);
