import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { ShoppingItem } from '../../../types/recipe';
import { formatAmount } from '../../../utils/shopping';

export default function CartScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([
    // Sample data - replace with actual cart items
  ]);

  const removeFromCart = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Shopping Cart</Text>
      </View>

      <ScrollView style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemAmount}>{formatAmount([{ amount: item.amount, unit: item.unit }])}</Text>
              {item.recipes.length > 0 && (
                <Text style={styles.recipeText}>
                  From: {item.recipes.map(r => r.title).join(', ')}
                </Text>
              )}
            </View>
            <Pressable 
              style={styles.deleteButton}
              onPress={() => removeFromCart(item.id)}>
              <Trash2 size={16} color="#94A3B8" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.checkoutButton}>
          <Check size={24} color="#FFFFFF" />
          <Text style={styles.checkoutText}>Complete Shopping</Text>
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  list: {
    flex: 1,
    padding: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  itemAmount: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  recipeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});