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
  OTHER = 'Other',
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  authorId: string;
  ingredients: Ingredient[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id?: string;
  recipe_id?: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingItem extends Ingredient {
  checked: boolean;
  recipes: {
    id: string;
    title: string;
  }[];
  totalAmount: string;
}

export interface Instruction {
  id?: string;
  recipe_id?: string;
  step_number: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  ingredients: Ingredient[];
  instructions: string[];
}
