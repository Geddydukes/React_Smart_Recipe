import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { TUTORIAL_STEPS } from '@/services/tutorial';
import { onboardingService } from '@/services/onboarding';
import { useTutorial } from '@/hooks/useTutorial';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const theme = useTheme();
  const {
    progress: tutorialProgress,
    currentStep,
    showTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
  } = useTutorial();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const isComplete = await onboardingService.isOnboardingComplete();
      if (isComplete) {
        router.replace('/(tabs)/recipes');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Welcome to Chefing
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Let's get you started with your cooking journey
      </Text>

      <View style={styles.stepsContainer}>
        {TUTORIAL_STEPS.map((step) => (
          <View key={step.id} style={styles.stepCard}>
            <Text variant="titleMedium" style={styles.stepTitle}>
              {step.title}
            </Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
              {step.description}
            </Text>
            <Text variant="bodySmall" style={styles.points}>
              {step.points} points
            </Text>
            <Button
              mode={tutorialProgress[step.id] ? 'outlined' : 'contained'}
              onPress={() => startTutorial(step.id)}
              disabled={tutorialProgress[step.id]}
              style={styles.stepButton}
            >
              {tutorialProgress[step.id] ? 'Completed' : 'Start Tutorial'}
            </Button>
          </View>
        ))}
      </View>

      <TutorialOverlay
        visible={showTutorial}
        onDismiss={skipTutorial}
        onComplete={completeTutorial}
        step={currentStep || 'recipe'}
        title={
          currentStep
            ? TUTORIAL_STEPS.find((s) => s.id === currentStep)?.title || ''
            : ''
        }
        description={
          currentStep
            ? TUTORIAL_STEPS.find((s) => s.id === currentStep)?.description ||
              ''
            : ''
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  stepsContainer: {
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    color: '#666',
    marginBottom: 8,
  },
  points: {
    color: '#007AFF',
    marginBottom: 12,
  },
  stepButton: {
    marginTop: 8,
  },
});
