import { supabase } from '@/lib/supabase';
import {
  Recipe,
  Ingredient,
  Instruction,
  RecipeFormData,
} from '@/types/recipe';

export class RecipeService {
  async createRecipe(recipe: RecipeFormData): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([
        {
          title: recipe.title,
          description: recipe.description,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image_url: recipe.image,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(
          recipe.ingredients.map((ingredient) => ({
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

    // Insert instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
      const { error: instructionsError } = await supabase
        .from('instructions')
        .insert(
          recipe.instructions.map((content, index) => ({
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
      ingredients: recipe.ingredients.map((i) => i.name),
      instructions: recipe.instructions,
      createdAt: recipeData.created_at,
      updatedAt: recipeData.updated_at,
      authorId: recipeData.user_id,
    };
  }

  async getRecipe(id: string): Promise<Recipe> {
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

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.image_url,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      isFavorite: recipe.is_favorite,
      ingredients: ingredients.map((i) => i.name),
      instructions: instructions.map((i) => i.content),
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
      authorId: recipe.user_id,
    };
  }

  async getUserRecipes(): Promise<Recipe[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
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
          ingredients: ingredients.map((i) => i.name),
          instructions: instructions.map((i) => i.content),
          createdAt: recipe.created_at,
          updatedAt: recipe.updated_at,
          authorId: recipe.user_id,
        };
      }),
    );

    return recipesWithDetails;
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
      ingredients: recipe.ingredients?.map((i) => i.name) || [],
      instructions: recipe.instructions || [],
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
          ingredients: ingredients.map((i) => i.name),
          instructions: instructions.map((i) => i.content),
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
