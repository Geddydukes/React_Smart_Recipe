import { create } from 'zustand';
import { PantryItem, PantryItemFormData } from '@/types/pantry';
import { pantryService } from '@/services/pantry';

interface PantryState {
  items: PantryItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addItem: (item: PantryItemFormData) => Promise<void>;
  updateItem: (
    id: string,
    updates: Partial<PantryItemFormData>,
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  checkAvailability: (
    ingredient: string,
    amount: number,
    unit: string,
  ) => Promise<{
    available: boolean;
    amount: number;
    unit: string;
  } | null>;
  clearError: () => void;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => {
    try {
      set({ loading: true, error: null });
      const items = await pantryService.getPantryItems();
      set({ items, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load pantry items',
        loading: false,
      });
    }
  },

  addItem: async (item) => {
    try {
      set({ loading: true, error: null });
      await pantryService.addPantryItem(item);
      await get().loadItems();
      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to add pantry item',
        loading: false,
      });
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      await pantryService.updatePantryItem(id, updates);
      await get().loadItems();
      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update pantry item',
        loading: false,
      });
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      set({ loading: true, error: null });
      await pantryService.deletePantryItem(id);
      await get().loadItems();
      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete pantry item',
        loading: false,
      });
      throw error;
    }
  },

  checkAvailability: async (ingredient, amount, unit) => {
    try {
      return await pantryService.checkIngredientAvailability(
        ingredient,
        amount,
        unit,
      );
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check ingredient availability',
      });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
