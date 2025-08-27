"use client";

import React, { useState, useEffect, useRef } from "react";

import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import PuzzleDialog from "@/components/puzzle-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { Button } from "@/components/ui/button";
import GradientBorder from "@/components/ui/gradientBorder";
import { Input } from "@/components/ui/input";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

const PuzzleLandingPage = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [incorrectMessage, setIncorrectMessage] = useState("");
  const [showClueButton, setShowClueButton] = useState(false);
  const [showClueDialog, setShowClueDialog] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleComplete = async () => {
    if (message.toUpperCase() !== "TOILET OHIO RIZZ") {
      setIncorrectMessage("WRONG!!! Try Again.");
      return;
    }

    // Always show dialog immediately for better UX
    setShowCompletionDialog(true);
  };

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(6)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(6);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value.toUpperCase());
    setIncorrectMessage("");
  };

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Show clue button after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClueButton(true);
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClueClick = () => {
    setShowClueDialog(true);
  };

  return (
    <PuzzleRouteGuard stepNumber={6}>
      <main className="p-6 h-[calc(100vh-65px)]">
        <h1 className="text-4xl font-bold text-center mb-4">Secret Message</h1>
        <h2 className="text-center dark:text-neutral-400 mb-4">
          Decipher the message to continue. This <i>one</i> may frustrate you.
        </h2>
        <p className="text-center text-sky-600 dark:text-sky-500">
          You are not unscrambling the words, you are deciphering the message.
        </p>
        <div className="mt-12">
          <div className="text-4xl font-bold text-center mb-8">
            UPJMFU PIJP SJAA
          </div>
          <div className="flex flex-col items-center gap-4 mx-auto w-3/4 sm:w-2/3 md:w-1/3 lg:w-1/4">
            <Input
              ref={inputRef}
              className="text-center sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl sm:h-12"
              value={message}
              onChange={handleChange}
            />
            <Button onClick={handleComplete}>Submit</Button>
          </div>
          {incorrectMessage && (
            <p className="text-center text-red-500 mt-4 text-2xl">
              {incorrectMessage}
            </p>
          )}
        </div>

        {/* Clue button that appears after 60 seconds */}
        {showClueButton && (
          <div className="fixed bottom-6 right-6 animate-in slide-in-from-right-full duration-800 ease-out">
            <GradientBorder className="rounded-full" width={2}>
              <Button
                onClick={handleClueClick}
                className="bg-neutral-100 hover:bg-neutral-100/70 dark:bg-neutral-900 dark:hover:bg-neutral-900/70 text-neutral-950 dark:text-neutral-100 font-semibold shadow-lg rounded-full"
              >
                Clue?
              </Button>
            </GradientBorder>
          </div>
        )}

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={6}
          onContinue={handleDialogContinue}
        />

        <PuzzleDialog
          open={showClueDialog}
          setOpen={setShowClueDialog}
          title="Really? You need a clue?"
          description="Minus one for thinking there would be a clue here."
          continueButtonText="Close"
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default PuzzleLandingPage;
