import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  AccessibilityInfo,
} from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { recipeService } from '@/services/recipe';
import { analyticsService } from '@/services/analytics';
import { Recipe } from '@/types/recipe';
import { LoadingState } from '@/components/LoadingState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { accessibility } from '@/utils/accessibility';
import { Button, Card } from 'react-native-paper';

export default function RecipeListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await accessibility.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };
    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setIsScreenReaderEnabled(enabled);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const loadRecipes = useCallback(
    async (pageNum: number = 1) => {
      try {
        setError(null);
        const startTime = Date.now();
        const result = await recipeService.getUserRecipes(
          pageNum,
          ITEMS_PER_PAGE,
        );
        const endTime = Date.now();

        if (pageNum === 1) {
          setRecipes(result.recipes);
        } else {
          setRecipes((prev) => [...prev, ...result.recipes]);
        }

        setHasMore(result.hasMore);
        setCurrentPage(pageNum);

        // Track performance metrics
        await analyticsService.trackScreenLoad(
          'recipe_list',
          endTime - startTime,
        );
        await analyticsService.trackApiCall(
          'getUserRecipes',
          'GET',
          endTime - startTime,
          true,
        );

        if (isScreenReaderEnabled && pageNum === 1) {
          await accessibility.announceForAccessibility(
            `Loaded ${result.recipes.length} recipes`,
          );
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        await analyticsService.trackError(error, 'loadRecipes');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [isScreenReaderEnabled],
  );

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecipes(1);
  }, [loadRecipes]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    loadRecipes(currentPage + 1);
  }, [hasMore, isLoadingMore, currentPage, loadRecipes]);

  const handleRecipePress = useCallback(
    async (recipe: Recipe) => {
      await analyticsService.trackRecipeView(recipe.id, recipe.title);
      if (isScreenReaderEnabled) {
        accessibility.announceForAccessibility(`Opening ${recipe.title}`);
      }
      router.push(`/recipes/${recipe.id}`);
    },
    [isScreenReaderEnabled],
  );

  const handleAddRecipe = useCallback(async () => {
    await analyticsService.trackRecipeCreate('new', 'New Recipe');
    if (isScreenReaderEnabled) {
      accessibility.announceForAccessibility('Creating new recipe');
    }
    router.push('/recipes/new');
  }, [isScreenReaderEnabled]);

  const renderRecipeItem = useCallback(
    ({ item: recipe }: { item: Recipe }) => (
      <Card
        style={styles.recipeCard}
        onPress={() => handleRecipePress(recipe)}
        accessibilityLabel={`Recipe: ${recipe.title}`}
        accessibilityHint="Double tap to view recipe details"
        accessibilityRole="button"
      >
        <Card.Content>
          <Text variant="titleLarge" style={styles.recipeTitle}>
            {recipe.title}
          </Text>
          <Text variant="bodyMedium" style={styles.recipeDescription}>
            {recipe.description}
          </Text>
          <View style={styles.recipeMetadata}>
            <Text variant="bodySmall" style={styles.recipeMetadataText}>
              {recipe.cookTime} min • {recipe.servings} servings
            </Text>
          </View>
        </Card.Content>
      </Card>
    ),
    [handleRecipePress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isLoadingMore]);

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          loadRecipes(1);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRecipe}
          accessible={true}
          accessibilityLabel={accessibility.getAccessibilityLabel('addButton')}
          accessibilityHint={accessibility.getAccessibilityHint('addButton')}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading && recipes.length === 0 ? (
        <LoadingState />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              accessible={true}
              accessibilityLabel={accessibility.getAccessibilityLabel(
                'refreshButton',
              )}
              accessibilityHint={accessibility.getAccessibilityHint(
                'refreshButton',
              )}
            />
          }
          accessibilityLabel="Recipe list"
          accessibilityHint="Scroll to view more recipes"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  recipeTitle: {
    marginBottom: 8,
  },
  recipeDescription: {
    color: '#666',
    marginBottom: 8,
  },
  recipeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetadataText: {
    color: '#888',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
