import { supabase } from '@/lib/supabase';
import {
  Recipe,
  Ingredient,
  Instruction,
  RecipeFormData,
} from '@/types/recipe';
import { z } from 'zod';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Cache configuration
const CACHE_FOLDER = `${FileSystem.cacheDirectory}recipe_cache/`;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const PAGE_SIZE = 20;

// Input validation schemas
const ingredientSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  unit: z.string().min(1).max(20),
  category: z.string().min(1).max(50),
});

const recipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  cookTime: z.number().positive().max(1440), // Max 24 hours
  servings: z.number().positive().max(100),
  image: z.string().url().optional(),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().min(1)).min(1),
});

export class RecipeService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private prefetchQueue: Set<string> = new Set();

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    try {
      const cacheInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
      if (!cacheInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_FOLDER, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  private async cacheImage(url: string): Promise<string> {
    try {
      const filename = url.split('/').pop() || 'image.jpg';
      const cachePath = `${CACHE_FOLDER}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(cachePath);
      if (fileInfo.exists) {
        return cachePath;
      }

      await FileSystem.downloadAsync(url, cachePath);
      return cachePath;
    } catch (error) {
      console.error('Error caching image:', error);
      return url;
    }
  }

  private async prefetchRecipeData(recipeId: string) {
    if (this.prefetchQueue.has(recipeId)) return;
    this.prefetchQueue.add(recipeId);

    try {
      const recipe = await this.getRecipe(recipeId);
      this.cache.set(recipeId, {
        data: recipe,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error prefetching recipe:', error);
    } finally {
      this.prefetchQueue.delete(recipeId);
    }
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private async setCachedData<T>(key: string, data: T) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private validateRecipe(recipe: RecipeFormData): void {
    try {
      recipeSchema.parse(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid recipe data: ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  private sanitizeRecipe(recipe: RecipeFormData): RecipeFormData {
    return {
      ...recipe,
      title: recipe.title.trim(),
      description: recipe.description.trim(),
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        name: ingredient.name.trim(),
        unit: ingredient.unit.trim(),
        category: ingredient.category.trim(),
      })),
      instructions: recipe.instructions.map((instruction) =>
        instruction.trim(),
      ),
    };
  }

  async createRecipe(recipe: RecipeFormData): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate and sanitize input
    this.validateRecipe(recipe);
    const sanitizedRecipe = this.sanitizeRecipe(recipe);

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([
        {
          title: sanitizedRecipe.title,
          description: sanitizedRecipe.description,
          cook_time: sanitizedRecipe.cookTime,
          servings: sanitizedRecipe.servings,
          image_url: sanitizedRecipe.image,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert ingredients with sanitized data
    if (sanitizedRecipe.ingredients && sanitizedRecipe.ingredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(
          sanitizedRecipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            category: ingredient.category,
            recipe_id: recipeData.id,
            user_id: user.id,
          })),
        );

      if (ingredientsError) throw ingredientsError;
    }

    // Insert instructions with sanitized data
    if (
      sanitizedRecipe.instructions &&
      sanitizedRecipe.instructions.length > 0
    ) {
      const { error: instructionsError } = await supabase
        .from('instructions')
        .insert(
          sanitizedRecipe.instructions.map((content, index) => ({
            content,
            step_number: index + 1,
            recipe_id: recipeData.id,
            user_id: user.id,
          })),
        );

      if (instructionsError) throw instructionsError;
    }

    return {
      id: recipeData.id,
      title: recipeData.title,
      description: recipeData.description,
      imageUrl: recipeData.image_url,
      cookTime: recipeData.cook_time,
      servings: recipeData.servings,
      isFavorite: false,
      ingredients: sanitizedRecipe.ingredients?.map((i) => i.name) ?? [],
      instructions: sanitizedRecipe.instructions ?? [],
      createdAt: recipeData.created_at,
      updatedAt: recipeData.updated_at,
      authorId: recipeData.user_id,
    };
  }

  async getRecipe(id: string): Promise<Recipe> {
    const cachedRecipe = await this.getCachedData<Recipe>(id);
    if (cachedRecipe) {
      return cachedRecipe;
    }

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (recipeError) throw recipeError;

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', id);

    if (ingredientsError) throw ingredientsError;

    const { data: instructions, error: instructionsError } = await supabase
      .from('instructions')
      .select('*')
      .eq('recipe_id', id)
      .order('step_number');

    if (instructionsError) throw instructionsError;

    const fullRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.image_url,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      isFavorite: recipe.is_favorite,
      ingredients: ingredients?.map((i) => i.name) ?? [],
      instructions: instructions?.map((i) => i.content) ?? [],
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
      authorId: recipe.user_id,
    };

    await this.setCachedData(id, fullRecipe);
    return fullRecipe;
  }

  async getUserRecipes(
    page: number = 1,
    pageSize: number = PAGE_SIZE,
  ): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const {
      data: recipes,
      error,
      count,
    } = await supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    const hasMore = count ? start + recipes.length < count : false;

    return {
      recipes: recipes || [],
      hasMore,
    };
  }

  async updateRecipe(
    id: string,
    recipe: Partial<RecipeFormData>,
  ): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingRecipe, error: existingError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError) throw existingError;
    if (existingRecipe.user_id !== user.id) throw new Error('Unauthorized');

    // Validate and sanitize input if provided
    if (recipe) {
      this.validateRecipe(recipe as RecipeFormData);
      recipe = this.sanitizeRecipe(recipe as RecipeFormData);
    }

    const { data: updatedRecipe, error: updateError } = await supabase
      .from('recipes')
      .update({
        title: recipe.title,
        description: recipe.description,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        image_url: recipe.image,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update ingredients if provided
    if (recipe.ingredients) {
      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .delete()
        .eq('recipe_id', id);

      if (ingredientsError) throw ingredientsError;

      if (recipe.ingredients.length > 0) {
        const { error: newIngredientsError } = await supabase
          .from('ingredients')
          .insert(
            recipe.ingredients.map((ingredient) => ({
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              category: ingredient.category,
              recipe_id: id,
              user_id: user.id,
            })),
          );

        if (newIngredientsError) throw newIngredientsError;
      }
    }

    // Update instructions if provided
    if (recipe.instructions) {
      const { error: instructionsError } = await supabase
        .from('instructions')
        .delete()
        .eq('recipe_id', id);

      if (instructionsError) throw instructionsError;

      if (recipe.instructions.length > 0) {
        const { error: newInstructionsError } = await supabase
          .from('instructions')
          .insert(
            recipe.instructions.map((content, index) => ({
              content,
              step_number: index + 1,
              recipe_id: id,
              user_id: user.id,
            })),
          );

        if (newInstructionsError) throw newInstructionsError;
      }
    }

    return {
      id: updatedRecipe.id,
      title: updatedRecipe.title,
      description: updatedRecipe.description,
      imageUrl: updatedRecipe.image_url,
      cookTime: updatedRecipe.cook_time,
      servings: updatedRecipe.servings,
      isFavorite: updatedRecipe.is_favorite,
      ingredients: recipe.ingredients?.map((i) => i.name) ?? [],
      instructions: recipe.instructions ?? [],
      createdAt: updatedRecipe.created_at,
      updatedAt: updatedRecipe.updated_at,
      authorId: updatedRecipe.user_id,
    };
  }

  async deleteRecipe(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (recipeError) throw recipeError;
    if (recipe.user_id !== user.id) throw new Error('Unauthorized');

    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false });

    if (recipesError) throw recipesError;

    const recipesWithDetails = await Promise.all(
      recipes.map(async (recipe) => {
        const { data: ingredients } = await supabase
          .from('ingredients')
          .select('*')
          .eq('recipe_id', recipe.id);

        const { data: instructions } = await supabase
          .from('instructions')
          .select('*')
          .eq('recipe_id', recipe.id)
          .order('step_number');

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          imageUrl: recipe.image_url,
          cookTime: recipe.cook_time,
          servings: recipe.servings,
          isFavorite: recipe.is_favorite,
          ingredients: ingredients?.map((i) => i.name) ?? [],
          instructions: instructions?.map((i) => i.content) ?? [],
          createdAt: recipe.created_at,
          updatedAt: recipe.updated_at,
          authorId: recipe.user_id,
        };
      }),
    );

    return recipesWithDetails;
  }
}

export const recipeService = new RecipeService();
