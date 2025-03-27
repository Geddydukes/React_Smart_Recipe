import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { recipeService } from '@/services/recipe';
import { Ingredient, RecipeFormData } from '@/types/recipe';

export default function NewRecipeScreen() {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    ingredients: [],
    instructions: [],
  });

  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    amount: 0,
    unit: '',
    category: '',
  });

  const [newInstruction, setNewInstruction] = useState('');
  const [error, setError] = useState('');

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount || !newIngredient.unit) {
      setError('Please fill in all ingredient fields');
      return;
    }
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient as Ingredient],
    });
    setNewIngredient({ name: '', amount: 0, unit: '', category: '' });
    setError('');
  };

  const addInstruction = () => {
    if (!newInstruction.trim()) {
      setError('Please enter an instruction');
      return;
    }
    setFormData({
      ...formData,
      instructions: [...formData.instructions, newInstruction],
    });
    setNewInstruction('');
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.title ||
        !formData.description ||
        formData.ingredients.length === 0 ||
        formData.instructions.length === 0
      ) {
        setError('Please fill in all required fields');
        return;
      }

      await recipeService.createRecipe(formData);
      router.push('/recipes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Recipe</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Recipe title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="Recipe description"
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Prep Time (minutes)</Text>
        <TextInput
          style={styles.input}
          value={formData.prepTime.toString()}
          onChangeText={(text) =>
            setFormData({ ...formData, prepTime: parseInt(text) || 0 })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cook Time (minutes)</Text>
        <TextInput
          style={styles.input}
          value={formData.cookTime.toString()}
          onChangeText={(text) =>
            setFormData({ ...formData, cookTime: parseInt(text) || 0 })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Servings</Text>
        <TextInput
          style={styles.input}
          value={formData.servings.toString()}
          onChangeText={(text) =>
            setFormData({ ...formData, servings: parseInt(text) || 1 })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {formData.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.listItem}>
            {ingredient.amount} {ingredient.unit} {ingredient.name}
          </Text>
        ))}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newIngredient.name}
            onChangeText={(text) =>
              setNewIngredient({ ...newIngredient, name: text })
            }
            placeholder="Ingredient name"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newIngredient.amount?.toString()}
            onChangeText={(text) =>
              setNewIngredient({
                ...newIngredient,
                amount: parseFloat(text) || 0,
              })
            }
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newIngredient.unit}
            onChangeText={(text) =>
              setNewIngredient({ ...newIngredient, unit: text })
            }
            placeholder="Unit"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={addIngredient}>
          <Text style={styles.buttonText}>Add Ingredient</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {formData.instructions.map((instruction, index) => (
          <Text key={index} style={styles.listItem}>
            {index + 1}. {instruction}
          </Text>
        ))}

        <TextInput
          style={[styles.input, styles.textArea]}
          value={newInstruction}
          onChangeText={setNewInstruction}
          placeholder="Enter instruction step"
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={addInstruction}>
          <Text style={styles.buttonText}>Add Instruction</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
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
  },
});
