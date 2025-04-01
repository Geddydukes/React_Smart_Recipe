import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analytics';

const TUTORIAL_PROGRESS_KEY = '@tutorial_progress';
const TUTORIAL_COMPLETE_KEY = '@tutorial_complete';

export interface TutorialProgress {
  recipe: boolean;
  shopping: boolean;
  cooking: boolean;
  tracking: boolean;
}

export interface TutorialStep {
  id: 'recipe' | 'shopping' | 'cooking' | 'tracking';
  title: string;
  description: string;
  points: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'recipe',
    title: 'Find Your Recipe',
    description:
      'Browse recipes or use AI to generate one that matches your preferences.',
    points: 25,
  },
  {
    id: 'shopping',
    title: 'Plan Your Shopping',
    description:
      'Review and manage your shopping list, marking items you already have.',
    points: 25,
  },
  {
    id: 'cooking',
    title: 'Cook Your Meal',
    description:
      'Follow step-by-step instructions and use the timer for perfect timing.',
    points: 25,
  },
  {
    id: 'tracking',
    title: 'Track Your Progress',
    description:
      'Take a photo of your creation and track calories for better health.',
    points: 25,
  },
];

export const tutorialService = {
  async getProgress(): Promise<TutorialProgress> {
    try {
      const progress = await AsyncStorage.getItem(TUTORIAL_PROGRESS_KEY);
      if (progress) {
        return JSON.parse(progress);
      }
      return {
        recipe: false,
        shopping: false,
        cooking: false,
        tracking: false,
      };
    } catch (error) {
      console.error('Error getting tutorial progress:', error);
      throw error;
    }
  },

  async updateProgress(
    step: keyof TutorialProgress,
    completed: boolean,
  ): Promise<void> {
    try {
      const progress = await this.getProgress();
      progress[step] = completed;
      await AsyncStorage.setItem(
        TUTORIAL_PROGRESS_KEY,
        JSON.stringify(progress),
      );

      if (completed) {
        const stepData = TUTORIAL_STEPS.find((s) => s.id === step);
        if (stepData) {
          await analyticsService.trackEvent({
            event_name: 'tutorial_step_complete',
            event_properties: {
              step_id: step,
              points_earned: stepData.points,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error updating tutorial progress:', error);
      throw error;
    }
  },

  async isComplete(): Promise<boolean> {
    try {
      const complete = await AsyncStorage.getItem(TUTORIAL_COMPLETE_KEY);
      return complete === 'true';
    } catch (error) {
      console.error('Error checking tutorial completion:', error);
      return false;
    }
  },

  async markComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETE_KEY, 'true');
      await analyticsService.trackEvent({
        event_name: 'tutorial_complete',
        event_properties: {
          total_points: TUTORIAL_STEPS.reduce(
            (sum, step) => sum + step.points,
            0,
          ),
        },
      });
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
      throw error;
    }
  },

  async resetProgress(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TUTORIAL_PROGRESS_KEY,
        TUTORIAL_COMPLETE_KEY,
      ]);
    } catch (error) {
      console.error('Error resetting tutorial progress:', error);
      throw error;
    }
  },
};
