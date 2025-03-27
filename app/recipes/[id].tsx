import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { recipeService } from '@/services/recipe';
import { shoppingService } from '@/services/shopping';
import { Recipe } from '@/types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToList, setAddingToList] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const recipeData = await recipeService.getRecipe(id);
      setRecipe(recipeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await recipeService.deleteRecipe(id);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) return;

    try {
      setAddingToList(true);
      await shoppingService.addToShoppingList(
        recipe.ingredients,
        recipe.id,
        recipe.title
      );
      router.push('/shopping');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add to shopping list'
      );
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Recipe not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={loadRecipe}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.button, styles.addToListButton]}
            onPress={handleAddToShoppingList}
            disabled={addingToList}
          >
            {addingToList ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add to Shopping List</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Prep Time</Text>
          <Text style={styles.infoValue}>{recipe.prepTime} minutes</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cook Time</Text>
          <Text style={styles.infoValue}>{recipe.cookTime} minutes</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Servings</Text>
          <Text style={styles.infoValue}>{recipe.servings}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredient}>
            • {ingredient.amount} {ingredient.unit} {ingredient.name}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionContainer}>
            <Text style={styles.instructionNumber}>{index + 1}</Text>
            <Text style={styles.instruction}>{instruction}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    padding: 16,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  instructionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#007AFF',
  },
  instruction: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  button: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  addToListButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
