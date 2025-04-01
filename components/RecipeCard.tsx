import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Clock, Users, Star } from 'lucide-react-native';
import { Recipe } from '../types/recipe';

interface Props {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: recipe.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.metadataText}>{recipe.cookTime} min</Text>
          </View>
          <View style={styles.metadataItem}>
            <Users size={16} color="#64748B" />
            <Text style={styles.metadataText}>{recipe.servings} servings</Text>
          </View>
          {recipe.isFavorite && (
            <View style={styles.metadataItem}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
  },
});
