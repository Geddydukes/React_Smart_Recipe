export interface ParsedRecipe {
  title: string;
  description: string;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  confidence: 'High' | 'Medium' | 'Low';
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CalorieEstimation {
  foodItems: FoodItem[];
  totalCalories: number;
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
}
