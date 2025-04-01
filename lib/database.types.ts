export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          updated_at: string;
          created_at: string;
          email: string;
          full_name: string | null;
          points: number;
          level: number;
          streak_count: number;
          last_streak_date: string | null;
          total_achievements: number;
          total_challenges_completed: number;
          settings: Json | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          updated_at?: string;
          created_at?: string;
          email: string;
          full_name?: string | null;
          points?: number;
          level?: number;
          streak_count?: number;
          last_streak_date?: string | null;
          total_achievements?: number;
          total_challenges_completed?: number;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          updated_at?: string;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          points?: number;
          level?: number;
          streak_count?: number;
          last_streak_date?: string | null;
          total_achievements?: number;
          total_challenges_completed?: number;
          settings?: Json | null;
        };
      };
      recipes: {
        Row: {
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
          created_at: string;
          user_id: string;
          image_url: string | null;
          is_favorite: boolean;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          imageUrl: string;
          cookTime: number;
          servings: number;
          isFavorite?: boolean;
          ingredients: string[];
          instructions: string[];
          createdAt?: string;
          updatedAt?: string;
          created_at?: string;
          user_id: string;
          image_url?: string | null;
          is_favorite?: boolean;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          imageUrl?: string;
          cookTime?: number;
          servings?: number;
          isFavorite?: boolean;
          ingredients?: string[];
          instructions?: string[];
          createdAt?: string;
          updatedAt?: string;
          created_at?: string;
          user_id?: string;
          image_url?: string | null;
          is_favorite?: boolean;
          created_by?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          category: Database['public']['Enums']['grocery_category'];
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          category?: Database['public']['Enums']['grocery_category'];
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name?: string;
          amount?: number;
          unit?: string;
          category?: Database['public']['Enums']['grocery_category'];
          created_at?: string;
        };
      };
      instructions: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          step_number?: number;
          content?: string;
          created_at?: string;
        };
      };
      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopping_items: {
        Row: {
          id: string;
          list_id: string;
          ingredient_id: string | null;
          name: string | null;
          amount: number;
          unit: string;
          category: Database['public']['Enums']['grocery_category'];
          checked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          ingredient_id?: string | null;
          name?: string | null;
          amount: number;
          unit: string;
          category?: Database['public']['Enums']['grocery_category'];
          checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          ingredient_id?: string | null;
          name?: string | null;
          amount?: number;
          unit?: string;
          category?: Database['public']['Enums']['grocery_category'];
          checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          points: number;
          category:
            | 'nutrition'
            | 'streak'
            | 'social'
            | 'learning'
            | 'challenge';
          requirements: Json;
          rewards: Json;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon: string;
          points: number;
          category:
            | 'nutrition'
            | 'streak'
            | 'social'
            | 'learning'
            | 'challenge';
          requirements: Json;
          rewards: Json;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          points?: number;
          category?:
            | 'nutrition'
            | 'streak'
            | 'social'
            | 'learning'
            | 'challenge';
          requirements?: Json;
          rewards?: Json;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      learning_modules: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'nutrition' | 'cooking' | 'health' | 'lifestyle';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          content: Json;
          rewards: Json;
          prerequisites: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: 'nutrition' | 'cooking' | 'health' | 'lifestyle';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          content: Json;
          rewards: Json;
          prerequisites?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: 'nutrition' | 'cooking' | 'health' | 'lifestyle';
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          content?: Json;
          rewards?: Json;
          prerequisites?: string[] | null;
          created_at?: string;
        };
      };
      user_learning_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'daily' | 'weekly' | 'monthly' | 'custom';
          difficulty: 'easy' | 'medium' | 'hard';
          goals: Json;
          rewards: Json;
          social: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'daily' | 'weekly' | 'monthly' | 'custom';
          difficulty: 'easy' | 'medium' | 'hard';
          goals: Json;
          rewards: Json;
          social?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'daily' | 'weekly' | 'monthly' | 'custom';
          difficulty?: 'easy' | 'medium' | 'hard';
          goals?: Json;
          rewards?: Json;
          social?: Json | null;
          created_at?: string;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date: string;
          image_url: string | null;
          nutrients: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date: string;
          image_url?: string | null;
          nutrients?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date?: string;
          image_url?: string | null;
          nutrients?: Json | null;
          created_at?: string;
        };
      };
      daily_calories: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          target_calories: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          target_calories: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          target_calories?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      grocery_category:
        | 'Produce'
        | 'Meat & Seafood'
        | 'Dairy & Eggs'
        | 'Bakery'
        | 'Pantry'
        | 'Frozen'
        | 'Beverages'
        | 'Snacks'
        | 'Household'
        | 'Other';
    };
  };
}
