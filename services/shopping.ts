import { supabase } from '@/lib/supabase';
import { ShoppingItem, Ingredient } from '@/types/recipe';
import { pantryService } from './pantry';

export class ShoppingService {
  async getShoppingList() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addToShoppingList(
    items: Ingredient[],
    recipeId: string,
    recipeTitle: string,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check pantry availability for each ingredient
    const shoppingItems = await Promise.all(
      items.map(async (item) => {
        const availability = await pantryService.checkIngredientAvailability(
          item.name,
          item.amount,
          item.unit,
        );

        return {
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          category: item.category,
          user_id: user.id,
          recipe_id: recipeId,
          recipe_title: recipeTitle,
          in_pantry: availability?.available || false,
          pantry_amount: availability?.amount || 0,
          pantry_unit: availability?.unit || '',
        };
      }),
    );

    const { error } = await supabase
      .from('shopping_items')
      .insert(shoppingItems);

    if (error) throw error;
  }

  async toggleItemChecked(id: string, checked: boolean) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .update({ checked })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async removeItem(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async clearCheckedItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', user.id)
      .eq('checked', true);

    if (error) throw error;
  }

  async updateItemAmount(itemId: string, amount: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
