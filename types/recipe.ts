export enum GroceryCategory {
  PRODUCE = 'Produce',
  MEAT = 'Meat & Seafood',
  DAIRY = 'Dairy & Eggs',
  BAKERY = 'Bakery',
  PANTRY = 'Pantry',
  FROZEN = 'Frozen',
  BEVERAGES = 'Beverages',
  SNACKS = 'Snacks',
  HOUSEHOLD = 'Household',
  OTHER = 'Other'
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
  recipeId: string;
}

export interface ShoppingItem extends Ingredient {
  checked: boolean;
  recipes: {
    id: string;
    title: string;
  }[];
  totalAmount: string;
}