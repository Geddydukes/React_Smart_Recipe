import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  AlertCircle,
  BookOpen,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Recipe } from '../../types/recipe';
import { useDebounce } from '../../hooks/useDebounce';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { RecipeCard } from '../../components/RecipeCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export default function RecipeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.ilike('title', `%${debouncedSearch}%`);
      }

      if (filter === 'favorites') {
        query = query.eq('is_favorite', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleAddRecipe = () => {
    router.push('/recipes/new');
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard recipe={item} onPress={() => handleRecipePress(item.id)} />
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingState message="Loading recipes..." />;
    }

    if (error) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Error"
          message={error}
          actionText="Try Again"
          onAction={fetchRecipes}
        />
      );
    }

    if (recipes.length === 0) {
      return (
        <EmptyState
          icon={BookOpen}
          title="No Recipes"
          message={
            searchQuery
              ? 'No recipes found matching your search'
              : 'Add your first recipe to get started'
          }
          actionText="Add Recipe"
          onAction={handleAddRecipe}
        />
      );
    }

    return (
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>
          <Pressable style={styles.addButton} onPress={handleAddRecipe}>
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#64748B"
            />
          </View>
          <Pressable
            style={[
              styles.filterButton,
              filter === 'favorites' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
          >
            <Filter
              size={20}
              color={filter === 'favorites' ? '#FFFFFF' : '#64748B'}
            />
          </Pressable>
        </View>

        {renderContent()}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
});
