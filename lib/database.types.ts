export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          prep_time: number
          cook_time: number
          servings: number
          image_url: string | null
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          prep_time: number
          cook_time: number
          servings: number
          image_url?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          prep_time?: number
          cook_time?: number
          servings?: number
          image_url?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          amount: number
          unit: string
          category: Database['public']['Enums']['grocery_category']
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          amount: number
          unit: string
          category?: Database['public']['Enums']['grocery_category']
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          amount?: number
          unit?: string
          category?: Database['public']['Enums']['grocery_category']
          created_at?: string
        }
      }
      instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          content?: string
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      shopping_items: {
        Row: {
          id: string
          list_id: string
          ingredient_id: string | null
          name: string | null
          amount: number
          unit: string
          category: Database['public']['Enums']['grocery_category']
          checked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          ingredient_id?: string | null
          name?: string | null
          amount: number
          unit: string
          category?: Database['public']['Enums']['grocery_category']
          checked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          ingredient_id?: string | null
          name?: string | null
          amount?: number
          unit?: string
          category?: Database['public']['Enums']['grocery_category']
          checked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      grocery_category: 'Produce' | 'Meat & Seafood' | 'Dairy & Eggs' | 'Bakery' | 'Pantry' | 'Frozen' | 'Beverages' | 'Snacks' | 'Household' | 'Other'
    }
  }
}