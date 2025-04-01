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
  imageUrl: string;
  cookTime: number;
  servings: number;
  isFavorite: boolean;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
  };
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
  id: string;
  checked: boolean;
  recipe_id?: string;
  recipe_title?: string;
  in_pantry?: boolean;
  pantry_amount?: number;
  pantry_unit?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
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
