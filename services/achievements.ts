import { supabase } from '../lib/supabase';
import {
  Achievement,
  UserAchievement,
  AchievementProgress,
} from '../types/achievements';
import { notificationService } from './notifications';

export const achievementService = {
  async checkAchievements(userId: string): Promise<void> {
    try {
      // Fetch all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');

      if (achievementsError) throw achievementsError;

      // Fetch user achievements
      const { data: userAchievements, error: userAchievementsError } =
        await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId);

      if (userAchievementsError) throw userAchievementsError;

      // Check each achievement
      for (const achievement of achievements) {
        const userAchievement = userAchievements?.find(
          (ua) => ua.achievement_id === achievement.id,
        );

        if (!userAchievement) {
          // Create new user achievement
          await this.createUserAchievement(userId, achievement.id, 0);
          continue;
        }

        if (userAchievement.completed) continue;

        // Check prerequisites
        if (achievement.prerequisites) {
          const prerequisitesCompleted = achievement.prerequisites.every(
            (prereqId: string) =>
              userAchievements?.some(
                (ua) => ua.achievement_id === prereqId && ua.completed,
              ),
          );

          if (!prerequisitesCompleted) continue;
        }

        // Calculate progress based on achievement type
        const progress = await this.calculateProgress(userId, achievement);

        // Update user achievement
        await this.updateUserAchievement(
          userAchievement.id,
          progress,
          progress >= achievement.requirements.value,
        );
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  },

  async calculateProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    try {
      switch (achievement.requirements.type) {
        case 'calories':
          return await this.calculateCaloriesProgress(userId, achievement);
        case 'meals':
          return await this.calculateMealsProgress(userId, achievement);
        case 'streak':
          return await this.calculateStreakProgress(userId, achievement);
        case 'variety':
          return await this.calculateVarietyProgress(userId, achievement);
        case 'social':
          return await this.calculateSocialProgress(userId, achievement);
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating progress:', error);
      throw error;
    }
  },

  async calculateCaloriesProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('calories')
      .eq('user_id', userId)
      .gte(
        'date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (error) throw error;

    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  },

  async calculateMealsProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    const { count, error } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte(
        'date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (error) throw error;

    return count || 0;
  },

  async calculateStreakProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    let streak = 0;
    let currentDate = new Date();

    for (const meal of meals) {
      const mealDate = new Date(meal.date);
      const diffDays = Math.floor(
        (currentDate.getTime() - mealDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }

      currentDate = mealDate;
    }

    return streak;
  },

  async calculateVarietyProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    const { data: meals, error } = await supabase
      .from('meals')
      .select('meal_type')
      .eq('user_id', userId)
      .gte(
        'date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (error) throw error;

    const uniqueMealTypes = new Set(meals.map((meal) => meal.meal_type));
    return uniqueMealTypes.size;
  },

  async calculateSocialProgress(
    userId: string,
    achievement: Achievement,
  ): Promise<number> {
    // This is a placeholder for social achievements
    // Implement social features like sharing, following, etc.
    return 0;
  },

  async createUserAchievement(
    userId: string,
    achievementId: string,
    progress: number,
  ): Promise<void> {
    const { error } = await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievementId,
      progress,
      completed: false,
    });

    if (error) throw error;
  },

  async updateUserAchievement(
    userAchievementId: string,
    progress: number,
    completed: boolean,
  ): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .update({
        progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', userAchievementId);

    if (error) throw error;

    // If achievement was just completed, trigger notification
    if (completed) {
      const { data: userAchievement, error: fetchError } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `,
        )
        .eq('id', userAchievementId)
        .single();

      if (fetchError) throw fetchError;
      if (userAchievement) {
        await notificationService.scheduleAchievementNotification(
          userAchievement.achievement,
        );
      }
    }
  },

  async getAchievementProgress(
    userId: string,
    achievementId: string,
  ): Promise<AchievementProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `,
        )
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        achievement: data.achievement,
        progress: data.progress,
        completed: data.completed,
        completed_at: data.completed_at,
      };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      throw error;
    }
  },

  async getAllAchievementProgress(
    userId: string,
  ): Promise<AchievementProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `,
        )
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((ua) => ({
        achievement: ua.achievement,
        progress: ua.progress,
        completed: ua.completed,
        completed_at: ua.completed_at,
      }));
    } catch (error) {
      console.error('Error getting all achievement progress:', error);
      throw error;
    }
  },
};
