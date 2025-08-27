"use client";

import React, { useState } from "react";

import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { Button } from "@/components/ui/button";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

const Step1Page = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleComplete = async () => {
    // Always show dialog immediately for better UX
    setShowCompletionDialog(true);
  };

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(1)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(1);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  return (
    <PuzzleRouteGuard stepNumber={1}>
      <main className="p-6 h-[calc(100vh-65px)] relative cursor-default">
        <h1 className="text-4xl font-bold text-center mb-4">
          Hidden in Plain Sight
        </h1>
        <h2 className="text-center dark:text-neutral-400">
          This is an easy one. There&apos;s nothing here...or is there???
        </h2>
        <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button onClick={handleComplete}>Next</Button>
        </div>

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={1}
          onContinue={handleDialogContinue}
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default Step1Page;
