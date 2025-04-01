import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Trophy, Star } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import {
  Achievement,
  UserAchievement,
  AchievementCategory,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_RARITIES,
  ACHIEVEMENT_COLORS,
} from '../../types/achievements';

export default function AchievementDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] =
    useState<AchievementCategory>('calories');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } =
        await supabase.from('achievements').select('*');

      if (achievementsError) throw achievementsError;

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } =
        await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(
    (a) => a.category === selectedCategory,
  );

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find((ua) => ua.achievement_id === achievementId);
  };

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
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>Achievement Details</Text>
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
        {filteredAchievements.map((achievement) => {
          const userAchievement = getUserAchievement(achievement.id);
          const progress = userAchievement?.progress || 0;
          const completed = userAchievement?.completed || false;
          const progressColor = getProgressColor(completed, achievement.rarity);

          return (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementHeader}>
                <View style={styles.achievementIcon}>
                  <Trophy size={24} color={progressColor} />
                </View>
                <View style={styles.achievementTitleContainer}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementRarity}>
                    {ACHIEVEMENT_RARITIES[achievement.rarity]}
                  </Text>
                </View>
              </View>

              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>Requirements</Text>
                <Text style={styles.requirementsText}>
                  {achievement.requirements.value}{' '}
                  {achievement.requirements.unit || ''}
                </Text>
              </View>

              <View style={styles.rewards}>
                <Text style={styles.rewardsTitle}>Rewards</Text>
                <View style={styles.rewardsList}>
                  {achievement.rewards.map((reward, index) => (
                    <View key={index} style={styles.rewardItem}>
                      <Star size={16} color="#F59E0B" />
                      <Text style={styles.rewardText}>
                        {reward.value} {reward.type}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.progress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (progress / achievement.requirements.value) * 100
                        }%`,
                        backgroundColor: progressColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress} / {achievement.requirements.value}{' '}
                  {achievement.requirements.unit || ''}
                </Text>
              </View>
            </View>
          );
        })}
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
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
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  achievementTitleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementRarity: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  requirements: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  rewards: {
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  rewardsList: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progress: {
    marginTop: 16,
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
