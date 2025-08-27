import { doc, getDoc, setDoc } from "firebase/firestore";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";

interface PuzzleProgress {
  userId: string;
  step: number;
  completedSteps: number[];
  lastUpdated: Date;
}

export const usePuzzleProgress = () => {
  const { user } = useAuth();

  const getPuzzleProgress = async (): Promise<PuzzleProgress | null> => {
    if (!user) return null;

    try {
      const puzzleDocRef = doc(db, "puzzleGameStep", user.uid);
      const puzzleDoc = await getDoc(puzzleDocRef);

      if (puzzleDoc.exists()) {
        const data = puzzleDoc.data() as PuzzleProgress;
        return {
          userId: data.userId,
          step: data.step || 1,
          completedSteps: data.completedSteps || [],
          lastUpdated: data.lastUpdated,
        };
      } else {
        // Return default state for new users
        return {
          userId: user.uid,
          step: 1,
          completedSteps: [],
          lastUpdated: new Date(),
        };
      }
    } catch (error) {
      console.error("Error fetching puzzle progress:", error);
      return null;
    }
  };

  const completeStep = async (stepNumber: number) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    if (stepNumber < 1 || stepNumber > 6) {
      console.error("Invalid step number");
      return false;
    }

    try {
      // Get current progress
      const currentProgress = await getPuzzleProgress();
      if (!currentProgress) {
        console.error("Failed to get current progress");
        return false;
      }

      // Add completed step if not already completed
      const updatedCompletedSteps = [...currentProgress.completedSteps];
      if (!updatedCompletedSteps.includes(stepNumber)) {
        updatedCompletedSteps.push(stepNumber);
        updatedCompletedSteps.sort((a, b) => a - b);
      }

      // Update current step to the highest completed step + 1 (or stay at 6 if all completed)
      const maxCompleted = Math.max(...updatedCompletedSteps);
      const newCurrentStep = Math.min(maxCompleted + 1, 6);

      const updatedProgress: PuzzleProgress = {
        userId: user.uid,
        step: newCurrentStep,
        completedSteps: updatedCompletedSteps,
        lastUpdated: new Date(),
      };

      // Save to Firebase (but don't redirect - let the dialog handle navigation)
      const puzzleDocRef = doc(db, "puzzleGameStep", user.uid);
      await setDoc(puzzleDocRef, updatedProgress);

      return true;
    } catch (error) {
      console.error("Error completing step:", error);
      return false;
    }
  };

  const resetProgress = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const initialProgress: PuzzleProgress = {
        userId: user.uid,
        step: 1,
        completedSteps: [],
        lastUpdated: new Date(),
      };

      const puzzleDocRef = doc(db, "puzzleGameStep", user.uid);
      await setDoc(puzzleDocRef, initialProgress);

      return initialProgress;
    } catch (error) {
      console.error("Error resetting progress:", error);
      return null;
    }
  };

  return { completeStep, getPuzzleProgress, resetProgress };
};
