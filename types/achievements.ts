export type AchievementCategory =
  | 'calories'
  | 'meals'
  | 'streak'
  | 'variety'
  | 'social';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: AchievementCategory;
  requirements: {
    type: string;
    value: number;
    unit?: string;
  };
  rewards: {
    type: string;
    value: number;
  }[];
  rarity: AchievementRarity;
  prerequisites?: string[];
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  achievement: Achievement;
}

export interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, string> = {
  calories: 'Calorie Tracking',
  meals: 'Meal Logging',
  streak: 'Daily Streaks',
  variety: 'Food Variety',
  social: 'Social',
};

export const ACHIEVEMENT_RARITIES: Record<AchievementRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const ACHIEVEMENT_COLORS: Record<AchievementRarity, string> = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};
