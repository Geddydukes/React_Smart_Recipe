import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';
const USER_POINTS_KEY = '@user_points';

export const onboardingService = {
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  async markOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding as complete:', error);
      throw error;
    }
  },

  async awardPoints(points: number): Promise<void> {
    try {
      const currentPoints = await this.getUserPoints();
      const newPoints = currentPoints + points;
      await AsyncStorage.setItem(USER_POINTS_KEY, newPoints.toString());
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  },

  async getUserPoints(): Promise<number> {
    try {
      const points = await AsyncStorage.getItem(USER_POINTS_KEY);
      return points ? parseInt(points, 10) : 0;
    } catch (error) {
      console.error('Error getting user points:', error);
      return 0;
    }
  },
};
