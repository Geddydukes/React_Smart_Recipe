import { supabase } from '@/lib/supabase';
import { ShoppingItem, Ingredient } from '@/types/recipe';

export class ShoppingService {
  async addToShoppingList(
    items: Ingredient[],
    recipeId: string,
    recipeTitle: string
  ) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // For each ingredient, we need to check if it already exists in the shopping list
    for (const item of items) {
      const { data: existingItem } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', item.name)
        .eq('unit', item.unit)
        .single();

      if (existingItem) {
        // Update existing item
        await supabase
          .from('shopping_items')
          .update({
            amount: existingItem.amount + item.amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingItem.id);

        // Add recipe reference
        await supabase.from('shopping_item_recipes').insert({
          shopping_item_id: existingItem.id,
          recipe_id: recipeId,
          recipe_title: recipeTitle,
        });
      } else {
        // Create new item
        const { data: newItem, error } = await supabase
          .from('shopping_items')
          .insert({
            user_id: user.id,
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            category: item.category,
            checked: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Add recipe reference
        await supabase.from('shopping_item_recipes').insert({
          shopping_item_id: newItem.id,
          recipe_id: recipeId,
          recipe_title: recipeTitle,
        });
      }
    }
  }

  async getShoppingList() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: items, error } = await supabase
      .from('shopping_items')
      .select(
        `
        *,
        shopping_item_recipes (
          recipe_id,
          recipe_title
        )
      `
      )
      .eq('user_id', user.id)
      .order('category', { ascending: true });

    if (error) throw error;

    return items.map((item) => ({
      ...item,
      recipes: item.shopping_item_recipes.map((ref: any) => ({
        id: ref.recipe_id,
        title: ref.recipe_title,
      })),
    }));
  }

  async toggleItemChecked(itemId: string, checked: boolean) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .update({ checked, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async removeItem(itemId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async clearCheckedItems() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', user.id)
      .eq('checked', true);

    if (error) throw error;
  }

  async updateItemAmount(itemId: string, amount: number) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .update({ amount, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}

export const shoppingService = new ShoppingService();
