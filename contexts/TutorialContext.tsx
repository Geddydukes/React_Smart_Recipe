import React, { createContext, useContext, ReactNode } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialProgress } from '@/services/tutorial';

interface TutorialContextType {
  progress: TutorialProgress;
  currentStep: keyof TutorialProgress | null;
  showTutorial: boolean;
  startTutorial: (step: keyof TutorialProgress) => void;
  completeTutorial: () => Promise<void>;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tutorial = useTutorial();

  return (
    <TutorialContext.Provider value={tutorial}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialContext() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error(
      'useTutorialContext must be used within a TutorialProvider',
    );
  }
  return context;
}
