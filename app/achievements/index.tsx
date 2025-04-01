import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import {
  Achievement,
  UserAchievement,
  AchievementCategory,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_COLORS,
} from '../../types/achievements';

export default function AchievementsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] =
    useState<AchievementCategory>('calories');

  useEffect(() => {
    fetchUserAchievements();
  }, []);

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `,
        )
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = userAchievements.filter(
    (ua) => ua.achievement.category === selectedCategory,
  );

  const getProgressColor = (completed: boolean, rarity: string) => {
    if (completed)
      return ACHIEVEMENT_COLORS[rarity as keyof typeof ACHIEVEMENT_COLORS];
    return '#E5E7EB';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Pressable onPress={() => router.push('/achievements/details' as any)}>
          <ChevronRight size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        {(Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementCategory[]).map(
          (category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {ACHIEVEMENT_CATEGORIES[category]}
              </Text>
            </Pressable>
          ),
        )}
      </ScrollView>

      <ScrollView style={styles.content}>
        {filteredAchievements.map((userAchievement) => (
          <Pressable
            key={userAchievement.id}
            style={styles.achievementCard}
            onPress={() =>
              router.push(
                `/achievements/${userAchievement.achievement_id}` as any,
              )
            }
          >
            <View style={styles.achievementIcon}>
              <Trophy
                size={24}
                color={getProgressColor(
                  userAchievement.completed,
                  userAchievement.achievement.rarity,
                )}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>
                {userAchievement.achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {userAchievement.achievement.description}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (userAchievement.progress /
                          userAchievement.achievement.requirements.value) *
                        100
                      }%`,
                      backgroundColor: getProgressColor(
                        userAchievement.completed,
                        userAchievement.achievement.rarity,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {userAchievement.progress} /{' '}
                {userAchievement.achievement.requirements.value}{' '}
                {userAchievement.achievement.requirements.unit}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    margin: 16,
  },
});
