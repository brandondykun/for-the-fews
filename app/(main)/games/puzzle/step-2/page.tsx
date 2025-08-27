"use client";

import React, { useState } from "react";

import { KeyRound } from "lucide-react";

import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { Button } from "@/components/ui/button";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

import FalseButton from "../false-button";

const Step2Page = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [buttonsUnlocked, setButtonsUnlocked] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleComplete = async () => {
    // Always show dialog immediately for better UX
    setShowCompletionDialog(true);
  };

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(2)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(2);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  // Placeholder array to create 150 hidden buttons
  const arr = new Array(150).fill(0);

  return (
    <PuzzleRouteGuard stepNumber={2}>
      <main className="p-6 h-[calc(100vh-65px)] relative cursor-default">
        <h1 className="text-4xl font-bold text-center mb-4">
          The Key to Success
        </h1>
        <h2 className="text-center dark:text-neutral-400">
          It has been said that the <i>key</i> to success is persistence.
        </h2>
        {buttonsUnlocked && (
          <div className="text-center mt-8">
            <p className="mb-8 px-6">
              Nice work. You found the unlock button. But what did you unlock?
            </p>
            <FalseButton
              title="This is not the button you are looking for."
              description="This was merely a distraction. But you have unlocked something. I just can't say what it is."
              buttonText="Next"
              variant="default"
            />
          </div>
        )}
        {!buttonsUnlocked ? (
          <>
            <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FalseButton
                title="You haven't learned."
                description="Things are not always what they seem. Trust nothing."
                buttonText="Next"
                variant="default"
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FalseButton
                title="Not a chance."
                description="Once again you have fallen into a trap."
                buttonText="Next"
                variant="default"
              />
            </div>
            <div className="absolute bottom-2 left-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FalseButton
                title="Wrong."
                description="Keep looking."
                buttonText="Next"
                variant="default"
              />
            </div>
            <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Button onClick={() => setButtonsUnlocked(true)}>
                Unlock Buttons
              </Button>
            </div>
          </>
        ) : null}
        {buttonsUnlocked ? (
          <div className="mt-8 flex flex-row gap-2 flex-wrap justify-center">
            {arr.map((_, index) => {
              if (index === 76) {
                return (
                  <div
                    className="opacity-0 hover:opacity-100 transition-opacity duration-100"
                    key={index}
                  >
                    <Button key={index} onClick={handleComplete}>
                      <KeyRound size={32} />
                    </Button>
                  </div>
                );
              }
              return (
                <div
                  className="opacity-0 hover:opacity-100 transition-opacity duration-100"
                  key={index}
                >
                  <FalseButton
                    title="Wrong."
                    description="Keep looking."
                    buttonText="Next"
                    variant="default"
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={2}
          onContinue={handleDialogContinue}
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default Step2Page;
