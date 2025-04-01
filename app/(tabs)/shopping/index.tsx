import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Check, Trash2, Filter } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { GroceryCategory } from '../../../types/recipe';
import { ShoppingItem } from '../../../types/recipe';
import { shoppingService } from '../../../services/shopping';
import { useShoppingStore } from '../../../store/shopping';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export default function ShoppingScreen() {
  const [newItem, setNewItem] = useState('');
  const {
    items,
    loading,
    loadItems,
    addToShoppingList,
    toggleItemChecked,
    removeItem,
    clearCheckedItems,
  } = useShoppingStore();

  useEffect(() => {
    loadItems();
  }, []);

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category as GroceryCategory]) {
        acc[item.category as GroceryCategory] = [];
      }
      acc[item.category as GroceryCategory].push(item);
      return acc;
    },
    {} as Record<GroceryCategory, ShoppingItem[]>,
  );

  const handleToggleItem = async (id: string, checked: boolean) => {
    try {
      await toggleItemChecked(id, checked);
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleClearChecked = async () => {
    try {
      await clearCheckedItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear checked items');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      await addToShoppingList(
        [
          {
            name: newItem,
            amount: 1,
            unit: 'unit',
            category: GroceryCategory.OTHER,
          },
        ],
        '',
        'Manual Entry',
      );
      setNewItem('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  if (loading) {
    return <LoadingState message="Loading shopping list..." />;
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List</Text>
          <View style={styles.addContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add new item..."
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={handleAddItem}
              placeholderTextColor="#64748B"
            />
            <Pressable style={styles.filterButton}>
              <Filter size={24} color="#1E293B" />
            </Pressable>
            <Pressable style={styles.addButton} onPress={handleAddItem}>
              <Plus size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <View key={category} style={styles.category}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {categoryItems.map((item) => (
                <View key={item.id} style={styles.item}>
                  <Pressable
                    style={[
                      styles.checkbox,
                      item.checked && styles.checkboxChecked,
                    ]}
                    onPress={() => handleToggleItem(item.id, !item.checked)}
                  >
                    {item.checked && <Check size={16} color="#FFFFFF" />}
                  </Pressable>
                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemText,
                        item.checked && styles.itemTextChecked,
                      ]}
                    >
                      {item.name}
                      {item.amount > 1 && ` (${item.amount} ${item.unit})`}
                    </Text>
                    {item.recipe_title && (
                      <Text style={styles.recipeText}>
                        From: {item.recipe_title}
                      </Text>
                    )}
                    {item.in_pantry &&
                      item.pantry_amount &&
                      item.pantry_unit && (
                        <Text style={styles.pantryText}>
                          In pantry: {item.pantry_amount} {item.pantry_unit}
                        </Text>
                      )}
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 size={16} color="#94A3B8" />
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{items.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>
              {items.filter((item) => item.checked).length}
            </Text>
          </View>
          {items.some((item) => item.checked) && (
            <Pressable style={styles.clearButton} onPress={handleClearChecked}>
              <Text style={styles.clearButtonText}>Clear Checked</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 16,
  },
  addContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  category: {
    padding: 24,
  },
  categoryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  recipeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  pantryText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  summary: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  clearButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  clearButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
});
