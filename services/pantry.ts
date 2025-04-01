import { supabase } from '@/lib/supabase';
import { PantryItem, PantryItemFormData } from '@/types/pantry';

export class PantryService {
  async getPantryItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addPantryItem(item: PantryItemFormData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pantry_items')
      .insert([
        {
          ...item,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePantryItem(id: string, updates: Partial<PantryItemFormData>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pantry_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePantryItem(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async checkIngredientAvailability(
    ingredient: string,
    amount: number,
    unit: string,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', ingredient)
      .single();

    if (error) return null;
    if (!data) return null;

    return {
      available: data.amount >= amount && data.unit === unit,
      amount: data.amount,
      unit: data.unit,
    };
  }
}

export const pantryService = new PantryService();
