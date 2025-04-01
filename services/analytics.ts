import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

interface AnalyticsEvent {
  event_name: string;
  event_properties: Record<string, any>;
  user_id: string;
  device_info: {
    platform: string;
    version: string;
    model: string | null;
  };
  timestamp: string;
}

export const analyticsService = {
  async trackEvent(
    event: Omit<AnalyticsEvent, 'user_id' | 'device_info' | 'timestamp'>,
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const deviceInfo = {
        platform: Platform.OS,
        version: Application.nativeApplicationVersion || 'unknown',
        model: Platform.select({
          ios: await Application.getIosIdForVendorAsync(),
          android: Application.getAndroidId(),
          default: null,
        }),
      };

      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: user.id,
        device_info: deviceInfo,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert([analyticsEvent]);

      if (error) {
        console.error('Error tracking analytics event:', error);
      }
    } catch (error) {
      console.error('Error in analytics service:', error);
    }
  },

  // User Actions
  async trackRecipeView(recipeId: string, recipeTitle: string) {
    await this.trackEvent({
      event_name: 'recipe_view',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
      },
    });
  },

  async trackRecipeCreate(recipeId: string, recipeTitle: string) {
    await this.trackEvent({
      event_name: 'recipe_create',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
      },
    });
  },

  async trackRecipeEdit(recipeId: string, recipeTitle: string) {
    await this.trackEvent({
      event_name: 'recipe_edit',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
      },
    });
  },

  async trackRecipeDelete(recipeId: string, recipeTitle: string) {
    await this.trackEvent({
      event_name: 'recipe_delete',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
      },
    });
  },

  // Shopping List Actions
  async trackShoppingListAdd(
    recipeId: string,
    recipeTitle: string,
    itemCount: number,
  ) {
    await this.trackEvent({
      event_name: 'shopping_list_add',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
        item_count: itemCount,
      },
    });
  },

  async trackShoppingListRemove(itemId: string) {
    await this.trackEvent({
      event_name: 'shopping_list_remove',
      event_properties: {
        item_id: itemId,
      },
    });
  },

  // Social Actions
  async trackSocialShare(
    recipeId: string,
    recipeTitle: string,
    platform: string,
  ) {
    await this.trackEvent({
      event_name: 'social_share',
      event_properties: {
        recipe_id: recipeId,
        recipe_title: recipeTitle,
        platform,
      },
    });
  },

  async trackSocialImport(platform: string, success: boolean) {
    await this.trackEvent({
      event_name: 'social_import',
      event_properties: {
        platform,
        success,
      },
    });
  },

  // Performance Metrics
  async trackScreenLoad(screenName: string, loadTime: number) {
    await this.trackEvent({
      event_name: 'screen_load',
      event_properties: {
        screen_name: screenName,
        load_time_ms: loadTime,
      },
    });
  },

  async trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
  ) {
    await this.trackEvent({
      event_name: 'api_call',
      event_properties: {
        endpoint,
        method,
        duration_ms: duration,
        success,
      },
    });
  },

  // Error Tracking
  async trackError(error: Error, context: string) {
    await this.trackEvent({
      event_name: 'error',
      event_properties: {
        error_message: error.message,
        error_stack: error.stack,
        context,
      },
    });
  },

  // User Engagement
  async trackSessionStart() {
    await this.trackEvent({
      event_name: 'session_start',
      event_properties: {},
    });
  },

  async trackSessionEnd(duration: number) {
    await this.trackEvent({
      event_name: 'session_end',
      event_properties: {
        duration_ms: duration,
      },
    });
  },

  // Achievement Tracking
  async trackAchievementUnlock(achievementId: string, achievementName: string) {
    await this.trackEvent({
      event_name: 'achievement_unlock',
      event_properties: {
        achievement_id: achievementId,
        achievement_name: achievementName,
      },
    });
  },

  async trackOnboardingComplete(points: number): Promise<void> {
    await this.trackEvent({
      event_name: 'onboarding_complete',
      event_properties: {
        points_earned: points,
        completion_date: new Date().toISOString(),
      },
    });
  },
};
