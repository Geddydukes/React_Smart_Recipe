import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types/achievements';
import { ACHIEVEMENT_COLORS } from '../types/achievements';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationPreferences {
  achievements: boolean;
  dailyReminders: boolean;
  weeklyProgress: boolean;
  systemUpdates: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  achievements: true,
  dailyReminders: true,
  weeklyProgress: true,
  systemUpdates: true,
};

export const notificationService = {
  async requestPermissions() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Achievement Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      }

      return { status: finalStatus };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      throw error;
    }
  },

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  async setPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notificationPreferences',
        JSON.stringify(preferences),
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      throw error;
    }
  },

  async scheduleAchievementNotification(
    achievement: Achievement,
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.achievements) return;

      const color = ACHIEVEMENT_COLORS[achievement.rarity];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Achievement Unlocked!',
          body: achievement.title,
          data: {
            achievementId: achievement.id,
            points: achievement.points,
            rarity: achievement.rarity,
          },
        },
        trigger: null,
        android: {
          color,
          priority: 'high',
          channelId: 'achievements',
          style: {
            bigTextStyle: {
              bigText: achievement.description,
            },
          },
        },
        ios: {
          sound: true,
          badge: 1,
        },
      } as any);
    } catch (error) {
      console.error('Error scheduling achievement notification:', error);
      throw error;
    }
  },

  async scheduleDailyReminder(hour: number = 20): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.dailyReminders) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Log Your Meals!',
          body: "Don't forget to log your meals for today.",
        },
        trigger: {
          hour,
          minute: 0,
          repeats: true,
        } as any,
        android: {
          priority: 'high',
          channelId: 'reminders',
        },
        ios: {
          sound: true,
        },
      } as any);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      throw error;
    }
  },

  async scheduleWeeklyProgress(
    day: number = 0,
    hour: number = 9,
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.weeklyProgress) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Progress Summary',
          body: 'Check out your nutrition progress for this week!',
        },
        trigger: {
          weekday: day,
          hour,
          minute: 0,
          repeats: true,
        } as any,
        android: {
          priority: 'high',
          channelId: 'progress',
        },
        ios: {
          sound: true,
        },
      } as any);
    } catch (error) {
      console.error('Error scheduling weekly progress:', error);
      throw error;
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
      throw error;
    }
  },

  async getBadgeCountAsync(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      throw error;
    }
  },

  async setBadgeCountAsync(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
      throw error;
    }
  },
};
