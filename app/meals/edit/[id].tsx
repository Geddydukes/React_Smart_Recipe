import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../lib/database.types';

type Meal = Database['public']['Tables']['meals']['Row'];
type Nutrients = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function EditMealScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealData, setMealData] = useState({
    name: '',
    calories: 0,
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    nutrients: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

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
      if (data) {
        const nutrients = data.nutrients as Nutrients;
        setMealData({
          name: data.name,
          calories: data.calories,
          meal_type: data.meal_type,
          nutrients: {
            protein: nutrients.protein,
            carbs: nutrients.carbs,
            fat: nutrients.fat,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      setError('Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('meals')
        .update({
          name: mealData.name,
          calories: mealData.calories,
          meal_type: mealData.meal_type,
          nutrients: mealData.nutrients,
        })
        .eq('id', id);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Failed to update meal');
    } finally {
      setSaving(false);
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
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>Edit Meal</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Save size={24} color="#6366F1" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              style={styles.input}
              value={mealData.name}
              onChangeText={(text) => setMealData({ ...mealData, name: text })}
              placeholder="Enter meal name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              value={mealData.calories.toString()}
              onChangeText={(text) =>
                setMealData({ ...mealData, calories: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="Enter calories"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealTypeButtons}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(
                (type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      mealData.meal_type === type &&
                        styles.mealTypeButtonActive,
                    ]}
                    onPress={() =>
                      setMealData({ ...mealData, meal_type: type })
                    }
                  >
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        mealData.meal_type === type &&
                          styles.mealTypeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>

          <View style={styles.nutrients}>
            <Text style={styles.label}>Nutrients</Text>
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientField}>
                <Text style={styles.nutrientLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.nutrients.protein.toString()}
                  onChangeText={(text) =>
                    setMealData({
                      ...mealData,
                      nutrients: {
                        ...mealData.nutrients,
                        protein: parseFloat(text) || 0,
                      },
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutrientField}>
                <Text style={styles.nutrientLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.nutrients.carbs.toString()}
                  onChangeText={(text) =>
                    setMealData({
                      ...mealData,
                      nutrients: {
                        ...mealData.nutrients,
                        carbs: parseFloat(text) || 0,
                      },
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutrientField}>
                <Text style={styles.nutrientLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.nutrients.fat.toString()}
                  onChangeText={(text) =>
                    setMealData({
                      ...mealData,
                      nutrients: {
                        ...mealData.nutrients,
                        fat: parseFloat(text) || 0,
                      },
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  mealTypeButtonActive: {
    backgroundColor: '#6366F1',
  },
  mealTypeButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  mealTypeButtonTextActive: {
    color: '#fff',
  },
  nutrients: {
    marginTop: 20,
  },
  nutrientRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nutrientField: {
    flex: 1,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
