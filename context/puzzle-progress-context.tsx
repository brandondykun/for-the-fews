"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useAuth } from "@/context/auth-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

interface PuzzleProgressData {
  userId: string;
  step: number;
  completedSteps: number[];
  lastUpdated: Date;
}

interface PuzzleProgressContextType {
  progress: PuzzleProgressData | null;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  isStepUnlocked: (stepNumber: number) => boolean;
  isStepCompleted: (stepNumber: number) => boolean;
}

const PuzzleProgressContext = createContext<
  PuzzleProgressContextType | undefined
>(undefined);

interface PuzzleProgressProviderProps {
  children: ReactNode;
}

export const PuzzleProgressProvider: React.FC<PuzzleProgressProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const { getPuzzleProgress } = usePuzzleProgress();
  const [progress, setProgress] = useState<PuzzleProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const puzzleProgress = await getPuzzleProgress();
      if (puzzleProgress) {
        setProgress(puzzleProgress);
      } else {
        // Set default progress for new users
        setProgress({
          userId: user.uid,
          step: 1,
          completedSteps: [],
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading puzzle progress:", error);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const isStepUnlocked = (stepNumber: number): boolean => {
    if (!progress) return false;
    if (stepNumber === 1) return true; // First step is always unlocked
    return progress.completedSteps.includes(stepNumber - 1);
  };

  const isStepCompleted = (stepNumber: number): boolean => {
    if (!progress) return false;
    return progress.completedSteps.includes(stepNumber);
  };

  // Load progress when user changes or component mounts
  useEffect(() => {
    refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not the function

  const value: PuzzleProgressContextType = {
    progress,
    loading,
    refreshProgress,
    isStepUnlocked,
    isStepCompleted,
  };

  return (
    <PuzzleProgressContext.Provider value={value}>
      {children}
    </PuzzleProgressContext.Provider>
  );
};

export const usePuzzleProgressContext = (): PuzzleProgressContextType => {
  const context = useContext(PuzzleProgressContext);
  if (context === undefined) {
    throw new Error(
      "usePuzzleProgressContext must be used within a PuzzleProgressProvider"
    );
  }
  return context;
};
