import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { socialService } from '../services/social';
import { useRecipeStore } from '../store/recipe';

export default function ShareHandler() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const { createRecipe } = useRecipeStore();

  useEffect(() => {
    const handleShare = async () => {
      try {
        if (!url) {
          throw new Error('No URL provided');
        }

        const recipe = await socialService.importRecipe(url);
        await createRecipe({
          ...recipe,
          isFavorite: false,
          imageUrl: recipe.imageUrl || 'https://chefing.app/default-recipe.jpg',
          cookTime: recipe.cookTime || 30, // Default to 30 minutes if not specified
          servings: recipe.servings || 4, // Default to 4 servings if not specified
        });

        // Navigate to the recipe list
        router.replace('/(tabs)/recipes' as any);
      } catch (error) {
        console.error('Error handling share:', error);
        // Navigate to social screen with error
        router.replace('/(tabs)/social' as any);
      }
    };

    handleShare();
  }, [url]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
