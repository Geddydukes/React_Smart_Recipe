import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, TrendingUp, Clock, Users } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>Chef 👋</Text>
      </View>

      <View style={styles.featuredContainer}>
        <Image
          source="https://images.unsplash.com/photo-1547592180-85f173990554"
          style={styles.featuredImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredLabel}>Featured Recipe</Text>
          <Text style={styles.featuredTitle}>Homemade Pasta Carbonara</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color="#FFF" />
              <Text style={styles.metaText}>25 min</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color="#FFF" />
              <Text style={styles.metaText}>4 servings</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TrendingUp size={20} color="#FF6B6B" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeList}>
          {[1, 2, 3].map((i) => (
            <Link href="/recipes" key={i} asChild>
              <Pressable style={styles.recipeCard}>
                <Image
                  source="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  style={styles.recipeImage}
                  contentFit="cover"
                />
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeTitle}>Healthy Salad Bowl</Text>
                  <View style={styles.recipeMeta}>
                    <Text style={styles.recipeTime}>15 min</Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionGrid}>
          {['Generate Recipe Video', 'Add New Recipe', 'Shopping List', 'Meal Plan'].map((action) => (
            <Pressable key={action} style={styles.actionCard}>
              <Text style={styles.actionText}>{action}</Text>
            </Pressable>
          ))}
        </View>
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
  greeting: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  name: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginTop: 4,
  },
  featuredContainer: {
    margin: 24,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FF6B6B',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  featuredTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#FFFFFF',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  recipeList: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  recipeCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeTime: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    textAlign: 'center',
  },
});