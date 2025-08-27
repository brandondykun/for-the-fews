"use client";

import React, { useEffect, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";

interface PuzzleRouteGuardProps {
  stepNumber: number;
  children: ReactNode;
}

export const PuzzleRouteGuard: React.FC<PuzzleRouteGuardProps> = ({
  stepNumber,
  children,
}) => {
  const { progress, loading, isStepUnlocked } = usePuzzleProgressContext();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If no progress data (user not logged in), redirect to puzzle home
    if (!progress) {
      router.push("/games/puzzle");
      return;
    }

    // Check if the step is unlocked
    if (!isStepUnlocked(stepNumber)) {
      console.warn(`Unauthorized access attempt to step ${stepNumber}`);
      router.push("/games/puzzle");
      return;
    }
  }, [progress, loading, stepNumber, isStepUnlocked, router]);

  // Show loading state while checking permissions
  if (loading) {
    return (
      <main className="p-6 h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render content if user doesn't have access
  if (!progress || !isStepUnlocked(stepNumber)) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
};
