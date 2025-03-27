import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Plus, Check, Trash2, Filter } from 'lucide-react-native';
import { useState } from 'react';
import { GroceryCategory } from '../../types/recipe';

interface ShoppingItem {
  id: string;
  name: string;
  category: GroceryCategory;
  checked: boolean;
  recipeId?: string;
  recipeName?: string;
}

export default function ShoppingScreen() {
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: '1',
      name: 'Fresh Basil',
      category: GroceryCategory.PRODUCE,
      checked: false,
      recipeId: '1',
      recipeName: 'Classic Margherita Pizza'
    },
    {
      id: '2',
      name: 'Mozzarella',
      category: GroceryCategory.DAIRY,
      checked: false,
      recipeId: '1',
      recipeName: 'Classic Margherita Pizza'
    },
    {
      id: '3',
      name: 'Olive Oil',
      category: GroceryCategory.PANTRY,
      checked: false
    }
  ]);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<GroceryCategory, ShoppingItem[]>);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    
    setItems([...items, {
      id: Date.now().toString(),
      name: newItem,
      category: GroceryCategory.OTHER,
      checked: false
    }]);
    setNewItem('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new item..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
            placeholderTextColor="#64748B"
          />
          <Pressable style={styles.filterButton}>
            <Filter size={24} color="#1E293B" />
          </Pressable>
          <Pressable style={styles.addButton} onPress={addItem}>
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
                  style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                  onPress={() => toggleItem(item.id)}>
                  {item.checked && <Check size={16} color="#FFFFFF" />}
                </Pressable>
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemText,
                    item.checked && styles.itemTextChecked
                  ]}>{item.name}</Text>
                  {item.recipeName && (
                    <Text style={styles.recipeText}>From: {item.recipeName}</Text>
                  )}
                </View>
                <Pressable 
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}>
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
            {items.filter(item => item.checked).length}
          </Text>
        </View>
      </View>
    </View>
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
  deleteButton: {
    padding: 4,
  },
  summary: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
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
});