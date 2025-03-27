import { Ingredient, GroceryCategory } from '../types/recipe';

interface ConsolidatedItem {
  name: string;
  amounts: {
    amount: number;
    unit: string;
  }[];
  category: GroceryCategory;
  recipes: {
    id: string;
    title: string;
  }[];
}

export function consolidateShoppingList(ingredients: Ingredient[], recipes: { id: string; title: string }[]): ConsolidatedItem[] {
  const itemMap = new Map<string, ConsolidatedItem>();

  ingredients.forEach(ingredient => {
    const recipe = recipes.find(r => r.id === ingredient.recipeId);
    if (!recipe) return;

    const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        name: ingredient.name,
        amounts: [],
        category: ingredient.category,
        recipes: []
      });
    }

    const item = itemMap.get(key)!;
    item.amounts.push({
      amount: ingredient.amount,
      unit: ingredient.unit
    });
    
    if (!item.recipes.some(r => r.id === recipe.id)) {
      item.recipes.push(recipe);
    }
  });

  return Array.from(itemMap.values()).map(item => ({
    ...item,
    amounts: consolidateAmounts(item.amounts)
  }));
}

function consolidateAmounts(amounts: { amount: number; unit: string }[]): { amount: number; unit: string }[] {
  const unitMap = new Map<string, number>();

  amounts.forEach(({ amount, unit }) => {
    const normalizedUnit = unit.toLowerCase();
    unitMap.set(normalizedUnit, (unitMap.get(normalizedUnit) || 0) + amount);
  });

  return Array.from(unitMap.entries()).map(([unit, amount]) => ({
    amount,
    unit
  }));
}

export function formatAmount(amounts: { amount: number; unit: string }[]): string {
  return amounts
    .map(({ amount, unit }) => `${amount} ${unit}${amount !== 1 ? 's' : ''}`)
    .join(' + ');
}