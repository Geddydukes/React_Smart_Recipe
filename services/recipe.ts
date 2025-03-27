import { supabase } from '@/lib/supabase';
import { Recipe, Ingredient } from '@/types/recipe';

export class RecipeService {
  async createRecipe(
    recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>
  ) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([
        {
          title: recipe.title,
          description: recipe.description,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image_url: recipe.image,
          author_id: user.id,
        },
      ])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert ingredients
    const ingredients = recipe.ingredients.map((ingredient) => ({
      recipe_id: recipeData.id,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      category: ingredient.category,
    }));

    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredients);

    if (ingredientsError) throw ingredientsError;

    // Insert instructions
    const instructions = recipe.instructions.map((instruction, index) => ({
      recipe_id: recipeData.id,
      step_number: index + 1,
      content: instruction,
    }));

    const { error: instructionsError } = await supabase
      .from('instructions')
      .insert(instructions);

    if (instructionsError) throw instructionsError;

    return recipeData;
  }

  async getRecipe(id: string) {
    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(
        `
        *,
        ingredients (*),
        instructions (*)
      `
      )
      .eq('id', id)
      .single();

    if (recipeError) throw recipeError;
    if (!recipe) throw new Error('Recipe not found');

    return recipe;
  }

  async getUserRecipes() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(
        `
        *,
        ingredients (*),
        instructions (*)
      `
      )
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return recipes;
  }

  async updateRecipe(id: string, updates: Partial<Recipe>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update({
        title: updates.title,
        description: updates.description,
        prep_time: updates.prepTime,
        cook_time: updates.cookTime,
        servings: updates.servings,
        image_url: updates.image,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('author_id', user.id)
      .select()
      .single();

    if (recipeError) throw recipeError;

    // If ingredients are provided, update them
    if (updates.ingredients) {
      // Delete existing ingredients
      await supabase.from('ingredients').delete().eq('recipe_id', id);

      // Insert new ingredients
      const ingredients = updates.ingredients.map((ingredient) => ({
        recipe_id: id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        category: ingredient.category,
      }));

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;
    }

    // If instructions are provided, update them
    if (updates.instructions) {
      // Delete existing instructions
      await supabase.from('instructions').delete().eq('recipe_id', id);

      // Insert new instructions
      const instructions = updates.instructions.map((instruction, index) => ({
        recipe_id: id,
        step_number: index + 1,
        content: instruction,
      }));

      const { error: instructionsError } = await supabase
        .from('instructions')
        .insert(instructions);

      if (instructionsError) throw instructionsError;
    }

    return recipe;
  }

  async deleteRecipe(id: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id);

    if (error) throw error;
  }

  async searchRecipes(query: string) {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(
        `
        *,
        ingredients (name),
        instructions (content)
      `
      )
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return recipes;
  }
}

export const recipeService = new RecipeService();
