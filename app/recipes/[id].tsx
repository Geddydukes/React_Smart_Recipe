import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Users, Star, Trash2, Edit2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Recipe } from '../../types/recipe';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LoadingState } from '../../components/LoadingState';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', id);

              if (error) throw error;
              router.back();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete recipe',
              );
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/recipes/${id}/edit`);
  };

  const toggleFavorite = async () => {
    if (!recipe) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .update({ isFavorite: !recipe.isFavorite })
        .eq('id', id);

      if (error) throw error;
      setRecipe((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null,
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update recipe',
      );
    }
  };

  if (loading) {
    return <LoadingState message="Loading recipe..." />;
  }

  if (error || !recipe) {
    return (
      <ErrorBoundary>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
            <Pressable style={styles.retryButton} onPress={fetchRecipe}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.description}>{recipe.description}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.actionButton,
                  recipe.isFavorite && styles.actionButtonActive,
                ]}
                onPress={toggleFavorite}
              >
                <Star
                  size={24}
                  color={recipe.isFavorite ? '#FFD700' : '#64748B'}
                  fill={recipe.isFavorite ? '#FFD700' : 'none'}
                />
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleEdit}>
                <Edit2 size={24} color="#64748B" />
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleDelete}>
                <Trash2 size={24} color="#EF4444" />
              </Pressable>
            </View>
          </View>

          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Clock size={20} color="#64748B" />
              <Text style={styles.metadataText}>{recipe.cookTime} min</Text>
            </View>
            <View style={styles.metadataItem}>
              <Users size={20} color="#64748B" />
              <Text style={styles.metadataText}>
                {recipe.servings} servings
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrients</Text>
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>
                  {recipe.nutrients?.protein || 0}g
                </Text>
                <Text style={styles.nutrientLabel}>Protein</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>
                  {recipe.nutrients?.carbs || 0}g
                </Text>
                <Text style={styles.nutrientLabel}>Carbs</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>
                  {recipe.nutrients?.fat || 0}g
                </Text>
                <Text style={styles.nutrientLabel}>Fat</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.listItem}>
                • {ingredient}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  metadata: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 16,
  },
  listItem: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: '#FF6B6B',
    marginRight: 12,
    width: 24,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nutrientItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutrientValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 4,
  },
  nutrientLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
  },
});
