import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { recipeService } from '@/services/recipe';
import { Recipe } from '@/types/recipe';

export default function RecipeListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const userRecipes = await recipeService.getUserRecipes();
      setRecipes(userRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleAddRecipe = () => {
    router.push('/recipes/new');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadRecipes}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
          <Text style={styles.buttonText}>Add Recipe</Text>
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No recipes yet</Text>
          <TouchableOpacity style={styles.button} onPress={handleAddRecipe}>
            <Text style={styles.buttonText}>Create Your First Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recipeCard}
              onPress={() => handleRecipePress(item.id)}
            >
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.recipeInfo}>
                <Text style={styles.infoText}>Prep: {item.prepTime}m</Text>
                <Text style={styles.infoText}>Cook: {item.cookTime}m</Text>
                <Text style={styles.infoText}>Serves: {item.servings}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
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
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});
