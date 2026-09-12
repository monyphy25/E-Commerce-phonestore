import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string; // Internal cart item id (e.g. product.id + variant specs)
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  storage?: string;
  brand: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>, variantId?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item, variantId) => {
        const id = variantId ? `${item.productId}-${variantId}` : item.productId;
        
        set((state) => {
          const existingItem = state.items.find((i) => i.id === id);
          
          if (existingItem) {
            return {
              items: state.items.map((i) => 
                i.id === id 
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          
          return { items: [...state.items, { ...item, id }] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) => 
            i.id === id ? { ...i, quantity } : i
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'phonestore-cart',
    }
  )
)
