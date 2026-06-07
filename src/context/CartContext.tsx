import React, { createContext, useCallback, useContext, useReducer } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; menu_item_id: string }
  | { type: 'SET_QUANTITY'; menu_item_id: string; quantity: number }
  | { type: 'CLEAR' };

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menu_item_id: string) => void;
  setQuantity: (menu_item_id: string, quantity: number) => void;
  clearCart: () => void;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.menu_item_id === action.item.menu_item_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menu_item_id === action.item.menu_item_id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.menu_item_id !== action.menu_item_id) };
    case 'SET_QUANTITY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.menu_item_id !== action.menu_item_id) };
      }
      return {
        items: state.items.map((i) =>
          i.menu_item_id === action.menu_item_id ? { ...i, quantity: action.quantity } : i,
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', item });
  }, []);

  const removeItem = useCallback((menu_item_id: string) => {
    dispatch({ type: 'REMOVE_ITEM', menu_item_id });
  }, []);

  const setQuantity = useCallback((menu_item_id: string, quantity: number) => {
    dispatch({ type: 'SET_QUANTITY', menu_item_id, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, totalPrice, addItem, removeItem, setQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
