import { AccessibilityInfo, Platform } from 'react-native';

export const accessibility = {
  async isScreenReaderEnabled(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await AccessibilityInfo.isScreenReaderEnabled();
    }
    return false; // Android handles this differently
  },

  async announceForAccessibility(message: string): Promise<void> {
    if (Platform.OS === 'ios') {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  },

  getAccessibilityLabel(component: string, action?: string): string {
    const labels: Record<string, string> = {
      recipeCard: 'Recipe card',
      recipeTitle: 'Recipe title',
      recipeDescription: 'Recipe description',
      recipeImage: 'Recipe image',
      addButton: 'Add new recipe',
      refreshButton: 'Pull to refresh recipe list',
      loadingIndicator: 'Loading recipes',
      errorMessage: 'Error message',
      retryButton: 'Retry loading recipes',
    };

    const label = labels[component] || component;
    return action ? `${label} - ${action}` : label;
  },

  getAccessibilityHint(component: string): string {
    const hints: Record<string, string> = {
      recipeCard: 'Double tap to view recipe details',
      addButton: 'Double tap to create a new recipe',
      refreshButton: 'Pull down to refresh the recipe list',
      retryButton: 'Double tap to try loading recipes again',
    };

    return hints[component] || '';
  },
};
