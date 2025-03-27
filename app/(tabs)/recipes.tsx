import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Search, Filter, Clock, Users, ChevronRight } from 'lucide-react-native';

export default function RecipesScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#64748B" />
            <TextInput
              placeholder="Search recipes..."
              style={styles.searchInput}
              placeholderTextColor="#64748B"
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Filter size={20} color="#1E293B" />
          </Pressable>
        </View>
      </View>

      <View style={styles.categories}>
        {['All', 'Favorites', 'Recent', 'Videos'].map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryChip,
              category === 'All' && styles.categoryChipActive,
            ]}>
            <Text
              style={[
                styles.categoryText,
                category === 'All' && styles.categoryTextActive,
              ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.recipeGrid}>
        {[
          {
            title: 'Classic Margherita Pizza',
            image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca',
            time: '35 min',
            servings: 4,
          },
          {
            title: 'Thai Green Curry',
            image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
            time: '45 min',
            servings: 6,
          },
          {
            title: 'Chocolate Lava Cake',
            image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51',
            time: '25 min',
            servings: 2,
          },
          {
            title: 'Mediterranean Salad',
            image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
            time: '15 min',
            servings: 4,
          },
        ].map((recipe, index) => (
          <Pressable key={index} style={styles.recipeCard}>
            <Image source={recipe.image} style={styles.recipeImage} contentFit="cover" />
            <View style={styles.recipeContent}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.recipeMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#64748B" />
                  <Text style={styles.metaText}>{recipe.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={14} color="#64748B" />
                  <Text style={styles.metaText}>{recipe.servings}</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
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
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  recipeGrid: {
    padding: 24,
    gap: 16,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
  },
});