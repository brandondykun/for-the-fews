"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";

import { CheckCircle, Circle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

interface PuzzleStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  unlocked: boolean;
}

const PuzzleHomePage = () => {
  const { user } = useAuth();
  const { progress, loading, refreshProgress } = usePuzzleProgressContext();
  const { resetProgress } = usePuzzleProgress();
  const [steps, setSteps] = useState<PuzzleStep[]>([
    {
      id: 1,
      title: "Step 1: Hidden in Plain Sight",
      description: "Find the hidden button to continue.",
      completed: false,
      unlocked: true,
    },
    {
      id: 2,
      title: "Step 2: The Key to Success",
      description: "Unlock the secret with persistence.",
      completed: false,
      unlocked: false,
    },
    {
      id: 3,
      title: "Step 3: Button Chase",
      description: "Catch the elusive button.",
      completed: false,
      unlocked: false,
    },
    {
      id: 4,
      title: "Step 4: Quick Clicks",
      description: "Click the buttons before time runs out.",
      completed: false,
      unlocked: false,
    },
    {
      id: 5,
      title: "Step 5: The Pattern",
      description: "Match the pattern to win.",
      completed: false,
      unlocked: false,
    },
    {
      id: 6,
      title: "Step 6: Secret Message",
      description: "Decipher the secret message.",
      completed: false,
      unlocked: false,
    },
  ]);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Update steps when progress changes
  useEffect(() => {
    if (progress) {
      const completedSteps = progress.completedSteps || [];
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          completed: completedSteps.includes(step.id),
          unlocked: step.id === 1 || completedSteps.includes(step.id - 1),
        }))
      );
    }
  }, [progress]);

  // Show reset confirmation dialog
  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  // Cancel reset
  const handleResetCancel = () => {
    setShowResetDialog(false);
  };

  // Confirm reset and actually reset progress
  const handleResetConfirm = async () => {
    if (!user) return;

    try {
      const result = await resetProgress();
      if (result) {
        setSteps((prevSteps) =>
          prevSteps.map((step, index) => ({
            ...step,
            completed: false,
            unlocked: index === 0, // Only first step unlocked
          }))
        );
        // Refresh the context data
        await refreshProgress();
      }
    } catch (error) {
      console.error("Error resetting puzzle progress:", error);
    } finally {
      setShowResetDialog(false);
    }
  };

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;

  if (loading) {
    return (
      <main className="p-6 min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading your progress...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6 min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to play</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            You need to be logged in to track your puzzle progress.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 min-h-[calc(100vh-65px)] mb-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Puzzle Challenges
        </h1>
        <p className="text-center text-neutral-700 dark:text-neutral-300 mb-8">
          Welcome to the puzzle challenge. Each step is a unique mystery that
          requires creative thinking and persistence.
        </p>

        {/* Progress Summary */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-lg font-medium">
              {completedSteps}/{totalSteps} Completed
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {completedSteps === totalSteps
              ? "🎉 Congratulations! You've completed all puzzle steps for now! Check back later for more puzzles!"
              : `Keep going! ${totalSteps - completedSteps} step${totalSteps - completedSteps !== 1 ? "s" : ""} remaining.`}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-all duration-200 flex flex-col ${
                step.completed
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : step.unlocked
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:shadow-md"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
              }`}
            >
              <div className="flex-1 mb-4">
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  ) : step.unlocked ? (
                    <Circle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Lock className="w-6 h-6 text-neutral-400 flex-shrink-0" />
                  )}
                </div>

                <div className="flex justify-end">
                  {step.completed ? (
                    <Link href={`/games/puzzle/step-${step.id}`}>
                      <Button variant="outline">Play Again</Button>
                    </Link>
                  ) : step.unlocked ? (
                    <Link href={`/games/puzzle/step-${step.id}`}>
                      <Button>Start</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled>
                      Locked
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-5 bg-yellow-100/40 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 rounded-lg mb-8">
          <h3 className="font-semibold mb-2 text-lg">Tips for Success</h3>
          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
            <li>• Pay close attention to the hints and clues on each step</li>
            <li>• Things might not always be what they seem</li>
            <li>• Your progress is automatically saved</li>
            <li>• Don&apos;t be afraid to think outside the box!</li>
            <li>
              • You cannot receive help from other users on the Few&apos;s!
              That&apos;s cheating!
            </li>
          </ul>
        </div>

        {/* Reset Progress Button */}
        <div className="dark:bg-red-950/30 bg-red-100/40 p-5 rounded-lg border border-red-300 dark:border-red-800">
          <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
            Danger Zone
          </h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 md:mb-0">
              Do you want to reset your progress?
            </p>
            <div className="mt-4 text-center md:mt-0">
              <Button
                variant="outline"
                onClick={handleResetClick}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Reset Progress
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 dark:text-red-400">
              Reset Progress?
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to reset all your puzzle progress? This
              action cannot be undone and you will lose all completed steps.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleResetCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Reset Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PuzzleHomePage;
