import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Recipe } from '../../../types/recipe';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { LoadingState } from '../../../components/LoadingState';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    imageUrl: '',
    cookTime: 0,
    servings: 1,
    ingredients: [''],
    instructions: [''],
  });

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to fetch recipe',
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!recipe.title?.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          ...recipe,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save recipe',
      );
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ''],
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    setRecipe((prev) => ({
      ...prev,
      instructions: [...(prev.instructions || []), ''],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions?.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions?.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <LoadingState message="Loading recipe..." />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Recipe</Text>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={recipe.title}
                onChangeText={(title) =>
                  setRecipe((prev) => ({ ...prev, title }))
                }
                placeholder="Enter recipe title"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.description}
                onChangeText={(description) =>
                  setRecipe((prev) => ({ ...prev, description }))
                }
                placeholder="Enter recipe description"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={recipe.imageUrl}
                onChangeText={(imageUrl) =>
                  setRecipe((prev) => ({ ...prev, imageUrl }))
                }
                placeholder="Enter image URL"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Cook Time (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={recipe.cookTime?.toString()}
                  onChangeText={(cookTime) =>
                    setRecipe((prev) => ({
                      ...prev,
                      cookTime: parseInt(cookTime) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  value={recipe.servings?.toString()}
                  onChangeText={(servings) =>
                    setRecipe((prev) => ({
                      ...prev,
                      servings: parseInt(servings) || 1,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Ingredients</Text>
                <Pressable onPress={addIngredient}>
                  <Text style={styles.addButton}>Add</Text>
                </Pressable>
              </View>
              {recipe.ingredients?.map((ingredient, index) => (
                <View key={index} style={styles.listItem}>
                  <TextInput
                    style={[styles.input, styles.listInput]}
                    value={ingredient}
                    onChangeText={(value) => updateIngredient(index, value)}
                    placeholder={`Ingredient ${index + 1}`}
                    placeholderTextColor="#64748B"
                  />
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Instructions</Text>
                <Pressable onPress={addInstruction}>
                  <Text style={styles.addButton}>Add</Text>
                </Pressable>
              </View>
              {recipe.instructions?.map((instruction, index) => (
                <View key={index} style={styles.listItem}>
                  <TextInput
                    style={[styles.input, styles.listInput]}
                    value={instruction}
                    onChangeText={(value) => updateInstruction(index, value)}
                    placeholder={`Step ${index + 1}`}
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={2}
                  />
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeInstruction(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
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
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  form: {
    padding: 24,
    paddingTop: 0,
  },
  field: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  listInput: {
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#EF4444',
    fontSize: 20,
    lineHeight: 20,
  },
  addButton: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FF6B6B',
  },
});
