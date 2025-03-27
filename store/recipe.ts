import { create } from 'zustand';
import { Recipe } from '@/types/recipe';
import { recipeService } from '@/services/recipe';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  loadRecipes: () => Promise<void>;
  loadRecipe: (id: string) => Promise<void>;
  createRecipe: (
    recipe: Omit<Recipe, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  searchRecipes: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  loading: false,
  error: null,

  loadRecipes: async () => {
    try {
      set({ loading: true, error: null });
      const recipes = await recipeService.getUserRecipes();
      set({ recipes, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load recipes',
        loading: false,
      });
    }
  },

  loadRecipe: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const recipe = await recipeService.getRecipe(id);
      set({ currentRecipe: recipe, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load recipe',
        loading: false,
      });
    }
  },

  createRecipe: async (recipe) => {
    try {
      set({ loading: true, error: null });
      await recipeService.createRecipe(recipe);
      await get().loadRecipes();
      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create recipe',
        loading: false,
      });
      throw error;
    }
  },

  updateRecipe: async (id, recipe) => {
    try {
      set({ loading: true, error: null });
      await recipeService.updateRecipe(id, recipe);
      await get().loadRecipes();
      if (get().currentRecipe?.id === id) {
        await get().loadRecipe(id);
      }
      set({ loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update recipe',
        loading: false,
      });
      throw error;
    }
  },

  deleteRecipe: async (id) => {
    try {
      set({ loading: true, error: null });
      await recipeService.deleteRecipe(id);
      set({
        recipes: get().recipes.filter((recipe) => recipe.id !== id),
        currentRecipe:
          get().currentRecipe?.id === id ? null : get().currentRecipe,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete recipe',
        loading: false,
      });
      throw error;
    }
  },

  searchRecipes: async (query: string) => {
    try {
      set({ loading: true, error: null });
      const recipes = await recipeService.searchRecipes(query);
      set({ recipes, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to search recipes',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
