export interface PantryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PantryItemFormData {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export enum PantryCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT = 'meat',
  PANTRY = 'pantry',
  FROZEN = 'frozen',
  SPICES = 'spices',
  OTHER = 'other',
}
