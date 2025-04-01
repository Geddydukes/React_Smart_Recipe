export type SubscriptionPlan = 'monthly' | 'annual';

export interface SubscriptionPrice {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface SubscriptionPlans {
  monthly: SubscriptionPrice;
  annual: SubscriptionPrice;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'shopping' | 'recipes' | 'tracking' | 'general';
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'smart_shopping',
    name: 'Smart Shopping List',
    description:
      'AI-powered categorization and smart suggestions based on your shopping history',
    category: 'shopping',
  },
  {
    id: 'recipe_generation',
    name: 'AI Recipe Generation',
    description:
      'Generate personalized recipes based on your preferences and available ingredients',
    category: 'recipes',
  },
  {
    id: 'photo_calories',
    name: 'Photo Calorie Estimation',
    description:
      'Take a photo of your meal to get instant calorie and nutritional information',
    category: 'tracking',
  },
  {
    id: 'meal_planning',
    name: 'Advanced Meal Planning',
    description: 'Create and manage custom meal plans with nutritional goals',
    category: 'tracking',
  },
  {
    id: 'recipe_collections',
    name: 'Recipe Collections',
    description: 'Organize your favorite recipes into custom collections',
    category: 'recipes',
  },
  {
    id: 'family_sharing',
    name: 'Family Sharing',
    description: 'Share shopping lists and meal plans with family members',
    category: 'general',
  },
  {
    id: 'offline_access',
    name: 'Offline Access',
    description:
      'Access your recipes and shopping lists without internet connection',
    category: 'general',
  },
  {
    id: 'ad_free',
    name: 'Ad-Free Experience',
    description: 'Enjoy a clean, distraction-free interface',
    category: 'general',
  },
];
