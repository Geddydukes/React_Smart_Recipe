import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  tutorialService,
  TutorialProgress,
  TutorialStep,
} from '@/services/tutorial';

export function useTutorial() {
  const [progress, setProgress] = useState<TutorialProgress>({
    recipe: false,
    shopping: false,
    cooking: false,
    tracking: false,
  });
  const [currentStep, setCurrentStep] = useState<keyof TutorialProgress | null>(
    null,
  );
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const tutorialProgress = await tutorialService.getProgress();
      setProgress(tutorialProgress);
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    }
  };

  const startTutorial = (step: keyof TutorialProgress) => {
    setCurrentStep(step);
    setShowTutorial(true);
    navigateToStep(step);
  };

  const completeTutorial = async () => {
    if (currentStep) {
      try {
        await tutorialService.updateProgress(currentStep, true);
        setProgress((prev) => ({ ...prev, [currentStep]: true }));
        setShowTutorial(false);
        setCurrentStep(null);

        // Check if all steps are complete
        const allComplete = Object.values(progress).every(
          (completed) => completed,
        );
        if (allComplete) {
          await tutorialService.markComplete();
          router.replace('/(tabs)/recipes');
        }
      } catch (error) {
        console.error('Error completing tutorial step:', error);
      }
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setCurrentStep(null);
  };

  const navigateToStep = (step: keyof TutorialProgress) => {
    switch (step) {
      case 'recipe':
        router.push('/(tabs)/recipes');
        break;
      case 'shopping':
        router.push('/(tabs)/shopping');
        break;
      case 'cooking':
        router.push('/(tabs)/recipes');
        break;
      case 'tracking':
        router.push('/(tabs)/recipes');
        break;
    }
  };

  return {
    progress,
    currentStep,
    showTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
  };
}
