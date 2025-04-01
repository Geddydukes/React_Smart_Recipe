import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Meal = Database['public']['Tables']['meals']['Row'];
type Nutrients = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchMeal();
  }, [id]);

  const fetchMeal = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMeal(data);
    } catch (error) {
      console.error('Error fetching meal:', error);
      setError('Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from('meals').delete().eq('id', id);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Meal not found'}</Text>
      </View>
    );
  }

  const nutrients = meal.nutrients as Nutrients;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push(`/meals/edit/${meal.id}` as any)}
            style={styles.headerButton}
          >
            <Edit2 size={24} color="#6366F1" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.headerButton}>
            <Trash2 size={24} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {meal.image_url && (
          <Image
            source={{
              uri: `${supabase.storage.from('meal-images').getPublicUrl(meal.image_url).data.publicUrl}`,
            }}
            style={styles.image}
          />
        )}

        <View style={styles.details}>
          <Text style={styles.name}>{meal.name}</Text>
          <View style={styles.meta}>
            <Text style={styles.calories}>{meal.calories} calories</Text>
            <Text style={styles.mealType}>
              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
            </Text>
          </View>

          <View style={styles.nutrients}>
            <Text style={styles.sectionTitle}>Nutrients</Text>
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>{nutrients.protein}g</Text>
                <Text style={styles.nutrientLabel}>Protein</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>{nutrients.carbs}g</Text>
                <Text style={styles.nutrientLabel}>Carbs</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientValue}>{nutrients.fat}g</Text>
                <Text style={styles.nutrientLabel}>Fat</Text>
              </View>
            </View>
          </View>

          <View style={styles.date}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Text style={styles.dateText}>
              {new Date(meal.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  calories: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
  mealType: {
    fontSize: 16,
    color: '#6B7280',
  },
  nutrients: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  date: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
