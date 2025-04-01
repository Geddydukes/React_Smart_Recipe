import { create } from 'zustand';
import { ShoppingItem, Ingredient } from '@/types/recipe';
import { shoppingService } from '@/services/shopping';

interface ShoppingState {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addToShoppingList: (
    items: Ingredient[],
    recipeId: string,
    recipeTitle: string,
  ) => Promise<void>;
  toggleItemChecked: (itemId: string, checked: boolean) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  updateItemAmount: (itemId: string, amount: number) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await shoppingService.getShoppingList();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to load shopping list' });
    }
  },

  addToShoppingList: async (
    items: Ingredient[],
    recipeId: string,
    recipeTitle: string,
  ) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.addToShoppingList(items, recipeId, recipeTitle);
      const updatedItems = await shoppingService.getShoppingList();
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to add items to shopping list' });
      throw error;
    }
  },

  toggleItemChecked: async (itemId: string, checked: boolean) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.toggleItemChecked(itemId, checked);
      const updatedItems = await shoppingService.getShoppingList();
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to update item' });
      throw error;
    }
  },

  removeItem: async (itemId: string) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.removeItem(itemId);
      const updatedItems = await shoppingService.getShoppingList();
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to remove item' });
      throw error;
    }
  },

  clearCheckedItems: async () => {
    set({ loading: true, error: null });
    try {
      await shoppingService.clearCheckedItems();
      const updatedItems = await shoppingService.getShoppingList();
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to clear checked items' });
      throw error;
    }
  },

  updateItemAmount: async (itemId: string, amount: number) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.updateItemAmount(itemId, amount);
      const updatedItems = await shoppingService.getShoppingList();
      set({ items: updatedItems, loading: false });
    } catch (error) {
      set({ loading: false, error: 'Failed to update item amount' });
      throw error;
    }
  },
}));
