import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { shoppingService } from '@/services/shopping';
import { GroceryCategory, ShoppingItem } from '@/types/recipe';

export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    GroceryCategory.PRODUCE
  );

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const shoppingList = await shoppingService.getShoppingList();
      setItems(shoppingList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load shopping list'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !newItemAmount || !newItemUnit) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await shoppingService.addToShoppingList(
        [
          {
            name: newItemName,
            amount: parseFloat(newItemAmount),
            unit: newItemUnit,
            category: selectedCategory,
          },
        ],
        '', // No recipe ID for manually added items
        '' // No recipe title for manually added items
      );

      // Refresh the list
      await loadShoppingList();

      // Clear input fields
      setNewItemName('');
      setNewItemAmount('');
      setNewItemUnit('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    try {
      await shoppingService.toggleItemChecked(itemId, checked);
      setItems(
        items.map((item) => (item.id === itemId ? { ...item, checked } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await shoppingService.removeItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const handleClearChecked = async () => {
    try {
      await shoppingService.clearCheckedItems();
      setItems(items.filter((item) => !item.checked));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear checked items'
      );
    }
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleItem(item.id!, !item.checked)}
      >
        <View
          style={[styles.checkboxInner, item.checked && styles.checkboxChecked]}
        />
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
          {item.amount} {item.unit} {item.name}
        </Text>
        {item.recipes.length > 0 && (
          <Text style={styles.recipeText}>
            From: {item.recipes.map((r) => r.title).join(', ')}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id!)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        {items.some((item) => item.checked) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearChecked}
          >
            <Text style={styles.buttonText}>Clear Checked</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.addItemContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flex2]}
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder="Item name"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newItemAmount}
            onChangeText={setNewItemAmount}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
            placeholder="Unit"
          />
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <FlatList
            data={Object.values(GroceryCategory)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: category }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category &&
                      styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  addItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  categoryContainer: {
    marginTop: 12,
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#666',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    padding: 2,
  },
  checkboxInner: {
    flex: 1,
    borderRadius: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  recipeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 24,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  error: {
    color: '#FF3B30',
    padding: 16,
    textAlign: 'center',
  },
});
