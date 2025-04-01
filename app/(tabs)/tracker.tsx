import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Utensils, Trophy, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/ai';
import { CalorieEstimation } from '../../types/ai';
import { EmptyState } from '../../components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyCalories {
  target: number;
  consumed: number;
  remaining: number;
}

interface TutorialStep {
  title: string;
  description: string;
  targetRef: React.RefObject<View>;
}

const TUTORIAL_SHOWN_KEY = '@tracker_tutorial_shown';

export default function TrackerScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [calories, setCalories] = useState<DailyCalories>({
    target: 2000,
    consumed: 0,
    remaining: 2000,
  });

  const caloriesCardRef = useRef<View>(null);
  const addButtonRef = useRef<View>(null);
  const mealsSectionRef = useRef<View>(null);

  useEffect(() => {
    checkTutorialStatus();
    fetchMeals();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const tutorialShown = await AsyncStorage.getItem(TUTORIAL_SHOWN_KEY);
      if (!tutorialShown) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  const fetchMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (mealsError) throw mealsError;

      const totalCalories = mealsData.reduce(
        (sum, meal) => sum + meal.calories,
        0,
      );
      setMeals(mealsData);
      setCalories({
        target: 2000, // TODO: Get from user settings
        consumed: totalCalories,
        remaining: 2000 - totalCalories,
      });
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      title: 'Track Your Calories',
      description:
        'Keep track of your daily calorie intake and stay on top of your nutrition goals.',
      targetRef: caloriesCardRef,
    },
    {
      title: 'Add Meals',
      description:
        'Tap the + button to add a new meal. You can take a photo or choose from your gallery.',
      targetRef: addButtonRef,
    },
    {
      title: 'View Your Meals',
      description:
        'See all your meals for the day and their calorie content in this section.',
      targetRef: mealsSectionRef,
    },
  ];

  const handleAddMeal = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const estimation = await aiService.estimateCaloriesFromImage(
          result.assets[0].uri,
        );
        router.push({
          pathname: '/meals/create' as any,
          params: {
            imageUri: result.assets[0].uri,
            estimation: JSON.stringify(estimation),
          },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to process image');
    }
  };

  const renderTutorialOverlay = () => {
    if (!showTutorial) return null;

    const currentStepData = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    return (
      <Modal
        transparent
        visible={showTutorial}
        animationType="fade"
        onRequestClose={() => handleTutorialComplete()}
      >
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialContent}>
            <Text style={styles.tutorialTitle}>{currentStepData.title}</Text>
            <Text style={styles.tutorialDescription}>
              {currentStepData.description}
            </Text>
            <View style={styles.tutorialButtons}>
              <Pressable
                style={[styles.tutorialButton, styles.skipButton]}
                onPress={() => handleTutorialComplete()}
              >
                <Text style={styles.skipButtonText}>Skip Tutorial</Text>
              </Pressable>
              <Pressable
                style={[styles.tutorialButton, styles.nextButton]}
                onPress={() => {
                  if (isLastStep) {
                    handleTutorialComplete();
                  } else {
                    setCurrentStep((prev) => prev + 1);
                  }
                }}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Trophy}
        title="Error"
        message={error}
        actionText="Try Again"
        onAction={fetchMeals}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Calorie Tracker</Text>
          <Pressable
            ref={addButtonRef}
            style={styles.addButton}
            onPress={handleAddMeal}
          >
            <Plus size={24} color="#fff" />
          </Pressable>
        </View>

        <View ref={caloriesCardRef} style={styles.caloriesCard}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.caloriesGradient}
          >
            <Text style={styles.caloriesTitle}>Today's Calories</Text>
            <View style={styles.caloriesRow}>
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.consumed}</Text>
                <Text style={styles.caloriesLabel}>Consumed</Text>
              </View>
              <View style={styles.caloriesDivider} />
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.remaining}</Text>
                <Text style={styles.caloriesLabel}>Remaining</Text>
              </View>
              <View style={styles.caloriesDivider} />
              <View style={styles.caloriesItem}>
                <Text style={styles.caloriesValue}>{calories.target}</Text>
                <Text style={styles.caloriesLabel}>Target</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(calories.consumed / calories.target) * 100}%`,
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        <View ref={mealsSectionRef} style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No Meals Logged"
              message="Add your first meal to start tracking"
              actionText="Add Meal"
              onAction={handleAddMeal}
            />
          ) : (
            meals.map((meal) => (
              <Pressable
                key={meal.id}
                style={styles.mealCard}
                onPress={() => router.push(`/meals/${meal.id}` as any)}
              >
                {meal.image_url && (
                  <Image
                    source={{ uri: meal.image_url }}
                    style={styles.mealImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealType}>{meal.meal_type}</Text>
                  <Text style={styles.mealCalories}>
                    {meal.calories} calories
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
      {renderTutorialOverlay()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
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
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  caloriesGradient: {
    padding: 24,
  },
  caloriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  caloriesItem: {
    alignItems: 'center',
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  caloriesDivider: {
    width: 1,
    backgroundColor: '#fff',
    opacity: 0.2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fff',
    opacity: 0.2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  mealsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  mealInfo: {
    flex: 1,
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width - 48,
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  tutorialDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  tutorialButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  skipButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
