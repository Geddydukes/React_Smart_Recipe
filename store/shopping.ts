import { create } from 'zustand';
import { ShoppingItem, Ingredient } from '@/types/recipe';
import { shoppingService } from '@/services/shopping';

interface ShoppingState {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addItems: (
    items: Ingredient[],
    recipeId: string,
    recipeTitle: string
  ) => Promise<void>;
  toggleItem: (itemId: string, checked: boolean) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  updateItemAmount: (itemId: string, amount: number) => Promise<void>;
  clearError: () => void;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    try {
      const items = await shoppingService.getShoppingList();
      set({ items, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load shopping list' });
    }
  },

  addItems: async (items, recipeId, recipeTitle) => {
    try {
      set({ loading: true, error: null });
      await shoppingService.addToShoppingList(items, recipeId, recipeTitle);
      await get().loadItems(); // Reload the list to get updated items
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add items',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleItem: async (itemId, checked) => {
    try {
      set({ loading: true, error: null });
      await shoppingService.toggleItemChecked(itemId, checked);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, checked } : item
        ),
      }));
      set({ loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to update item' });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ loading: true, error: null });
      await shoppingService.removeItem(itemId);
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove item',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearCheckedItems: async () => {
    try {
      set({ loading: true, error: null });
      await shoppingService.clearCheckedItems();
      set((state) => ({
        items: state.items.filter((item) => !item.checked),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to clear checked items',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateItemAmount: async (itemId, amount) => {
    try {
      set({ loading: true, error: null });
      await shoppingService.updateItemAmount(itemId, amount);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, amount } : item
        ),
      }));
      set({ loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to update item amount' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
