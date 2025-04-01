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
import { Camera, Plus, Utensils, Trophy, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/ai';
import { CalorieEstimation } from '../../types/ai';
import { EmptyState } from '../../components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyCalories {
  target: number;
  consumed: number;
  remaining: number;
}

export default function TrackerScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [calories, setCalories] = useState<DailyCalories>({
    target: 2000,
    consumed: 0,
    remaining: 2000,
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (mealsError) throw mealsError;

      const totalCalories = mealsData.reduce(
        (sum, meal) => sum + meal.calories,
        0,
      );
      setMeals(mealsData);
      setCalories({
        target: 2000, // TODO: Get from user settings
        consumed: totalCalories,
        remaining: 2000 - totalCalories,
      });
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const estimation = await aiService.estimateCaloriesFromImage(
          result.assets[0].uri,
        );
        router.push({
          pathname: '/meals/create' as any,
          params: {
            imageUri: result.assets[0].uri,
            estimation: JSON.stringify(estimation),
          },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to process image');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Trophy}
        title="Error"
        message={error}
        actionText="Try Again"
        onAction={fetchMeals}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Calorie Tracker</Text>
          <Pressable style={styles.addButton} onPress={handleAddMeal}>
            <Plus size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.caloriesCard}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.caloriesGradient}
          >
            <Text style={styles.caloriesTitle}>Today's Calories</Text>
            <View style={styles.caloriesRow}>
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.consumed}</Text>
                <Text style={styles.caloriesLabel}>Consumed</Text>
              </View>
              <View style={styles.caloriesDivider} />
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.remaining}</Text>
                <Text style={styles.caloriesLabel}>Remaining</Text>
              </View>
              <View style={styles.caloriesDivider} />
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.target}</Text>
                <Text style={styles.caloriesLabel}>Target</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(calories.consumed / calories.target) * 100}%`,
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No Meals Logged"
              message="Add your first meal to start tracking"
              actionText="Add Meal"
              onAction={handleAddMeal}
            />
          ) : (
            meals.map((meal) => (
              <Pressable
                key={meal.id}
                style={styles.mealCard}
                onPress={() => router.push(`/meals/${meal.id}` as any)}
              >
                {meal.image_url && (
                  <Image
                    source={{ uri: meal.image_url }}
                    style={styles.mealImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealType}>{meal.meal_type}</Text>
                  <Text style={styles.mealCalories}>
                    {meal.calories} calories
                  </Text>
                </View>
              </Pressable>
            ))
          )}
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
  content: {
    flex: 1,
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caloriesGradient: {
    padding: 20,
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  caloriesItem: {
    alignItems: 'center',
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  caloriesDivider: {
    width: 1,
    backgroundColor: '#fff',
    opacity: 0.2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fff',
    opacity: 0.2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  mealsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  mealInfo: {
    flex: 1,
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
});
