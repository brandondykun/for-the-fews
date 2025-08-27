"use client";

import React, { useState, useEffect, useCallback } from "react";

import EvadingButton from "@/components/evading-button";
import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

const Step3Page = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [spaceBarPressed, setSpaceBarPressed] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleComplete = async () => {
    // Always show dialog immediately for better UX
    setShowCompletionDialog(true);
  };

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(3)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(3);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  // Keyboard handlers for space bar
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle space bar if completion dialog is open
      if (showCompletionDialog) return;

      if (event.code === "Space" && !spaceBarPressed) {
        setSpaceBarPressed(true);
        // Prevent default to avoid any browser scroll behavior
        event.preventDefault();
      }
    },
    [spaceBarPressed, showCompletionDialog]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle space bar if completion dialog is open
      if (showCompletionDialog) return;

      if (event.code === "Space") {
        setSpaceBarPressed(false);
        // Prevent default to avoid any browser scroll behavior
        event.preventDefault();
      }
    },
    [showCompletionDialog]
  );

  useEffect(() => {
    // Always listen for keyboard events to track space bar
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Reset space bar state when completion dialog opens
  useEffect(() => {
    if (showCompletionDialog) {
      setSpaceBarPressed(false);
    }
  }, [showCompletionDialog]);

  return (
    <PuzzleRouteGuard stepNumber={3}>
      <main className="p-6 h-[calc(100vh-65px)] relative cursor-default flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center mb-4">Button Chase</h1>
        <h2 className="text-center dark:text-neutral-400">
          This one might push your buttons. You might need some space to figure
          this one out.
        </h2>
        <div className="mt-8 flex-1 w-full">
          <EvadingButton
            detectionRadius={180}
            moveDistance={200}
            speed={350}
            evades={!spaceBarPressed}
            onClick={handleComplete}
          >
            Click Me
          </EvadingButton>
        </div>

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={3}
          onContinue={handleDialogContinue}
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default Step3Page;
