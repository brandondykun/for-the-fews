"use client";

import React, { useState, useEffect, useCallback } from "react";

import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { Button } from "@/components/ui/button";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";

interface ButtonPosition {
  id: number;
  x: number;
  y: number;
  clicked: boolean;
}

const Step4Page = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "won" | "lost"
  >("waiting");
  const [timeLeft, setTimeLeft] = useState(15.0);
  const [buttonPositions, setButtonPositions] = useState<ButtonPosition[]>([]);
  const [clickedButtons, setClickedButtons] = useState<Set<number>>(new Set());
  const [nextButtonToClick, setNextButtonToClick] = useState(1);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleComplete = async () => {
    // Always show dialog immediately for better UX
    setShowCompletionDialog(true);
  };

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(4)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(4);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  // Generate random positions for buttons
  const generateRandomPositions = useCallback(() => {
    const positions: ButtonPosition[] = [];
    const minDistance = 8; // Minimum distance between buttons (in percentage units)

    // Helper function to check if a position overlaps with existing positions
    const isValidPosition = (newX: number, newY: number): boolean => {
      return positions.every((existingPos) => {
        const deltaX = newX - existingPos.x;
        const deltaY = newY - existingPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        return distance >= minDistance;
      });
    };

    for (let i = 1; i <= 10; i++) {
      let x, y;
      let attempts = 0;
      let validPosition = false;

      do {
        // Generate random positions within a safe area below header
        x = Math.random() * 80 + 10; // 10% to 90% of container width
        y = Math.random() * 70 + 10; // 10% to 80% of game area height

        validPosition = isValidPosition(x, y);
        attempts++;
      } while (!validPosition && attempts < 100);

      // If we couldn't find a valid position after many attempts,
      // place it anyway but try to find the least conflicting spot
      if (!validPosition && attempts >= 100) {
        let bestX = x;
        let bestY = y;
        let maxMinDistance = 0;

        // Try a few more positions and pick the one with maximum minimum distance
        for (
          let fallbackAttempts = 0;
          fallbackAttempts < 20;
          fallbackAttempts++
        ) {
          const testX = Math.random() * 80 + 10;
          const testY = Math.random() * 70 + 10;

          const minDistanceToOthers = Math.min(
            ...positions.map((pos) => {
              const deltaX = testX - pos.x;
              const deltaY = testY - pos.y;
              return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            }),
            Infinity
          );

          if (minDistanceToOthers > maxMinDistance) {
            maxMinDistance = minDistanceToOthers;
            bestX = testX;
            bestY = testY;
          }
        }

        x = bestX;
        y = bestY;
      }

      positions.push({
        id: i,
        x,
        y,
        clicked: false,
      });
    }

    return positions;
  }, []);

  // Start the game
  const startGame = () => {
    setGameState("playing");
    setTimeLeft(15.0);
    setClickedButtons(new Set());
    setNextButtonToClick(1);
    setButtonPositions(generateRandomPositions());
  };

  // Handle button click
  const handleButtonClick = (buttonId: number) => {
    if (gameState !== "playing") return;

    // Only allow clicking the correct next button in sequence
    if (buttonId !== nextButtonToClick) return;

    setClickedButtons((prev) => new Set([...prev, buttonId]));
    setButtonPositions((prev) =>
      prev.map((btn) => (btn.id === buttonId ? { ...btn, clicked: true } : btn))
    );
    setNextButtonToClick((prev) => prev + 1);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 0.1);
          return Math.round(newTime * 10) / 10; // Round to 1 decimal place
        });
      }, 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      setGameState("lost");
    }

    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (gameState === "playing" && nextButtonToClick === 11) {
      setGameState("won");
    }
  }, [nextButtonToClick, gameState]);

  // Reset game for retry
  const resetGame = () => {
    setGameState("waiting");
    setTimeLeft(15.0);
    setClickedButtons(new Set());
    setNextButtonToClick(1);
    setButtonPositions([]);
  };

  return (
    <PuzzleRouteGuard stepNumber={4}>
      <main className="p-6 h-[calc(100vh-65px)] relative cursor-default flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center mb-4">Quick Clicks</h1>
        <h2 className="text-center dark:text-neutral-400 mb-4">
          Time to be tested under pressure. Press all the buttons in numerical
          order (1, 2, 3...) within 15 seconds.
        </h2>

        {/* Timer */}
        {gameState === "playing" && (
          <div className="text-3xl font-bold mb-4 text-red-500">
            Time: {timeLeft.toFixed(2)}s
          </div>
        )}

        {/* Game States */}
        {gameState === "waiting" && (
          <div className="text-center">
            <p className="mb-4 text-lg">Click Start to begin! Good luck!</p>
            <Button onClick={startGame} size="lg">
              Start
            </Button>
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center">
            <p className="mb-4 text-lg text-red-500 font-semibold">
              Time&apos;s up! You reached button {nextButtonToClick - 1} out of
              10.
            </p>
            <Button onClick={resetGame} size="lg">
              Try Again
            </Button>
          </div>
        )}

        {gameState === "won" && (
          <div className="text-center">
            <p className="mb-4 text-lg text-green-500 font-semibold">
              Congratulations! You clicked all buttons with {timeLeft} seconds
              to spare!
            </p>
            <Button size="lg" onClick={handleComplete}>
              Proceed
            </Button>
          </div>
        )}

        {/* Game Buttons */}
        {gameState === "playing" && (
          <div className="absolute top-32 left-0 right-0 bottom-0 pointer-events-none">
            {buttonPositions.map((button) => (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button.id)}
                disabled={button.clicked}
                className={`
                  absolute pointer-events-auto
                  w-12 h-12 rounded-md font-semibold text-white transition-all duration-200
                  ${
                    button.clicked
                      ? "bg-green-500 cursor-not-allowed opacity-50"
                      : "bg-sky-500 hover:bg-sky-600 active:scale-95 shadow-lg hover:shadow-xl"
                  }
                `}
                style={{
                  left: `${button.x}%`,
                  top: `${button.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {button.id}
              </button>
            ))}
          </div>
        )}

        {/* Progress indicator during game */}
        {gameState === "playing" && (
          <div className="fixed bottom-6 left-6 bg-black/20 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm font-medium">
              Progress: {clickedButtons.size} / 10 buttons
            </p>
          </div>
        )}

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={4}
          onContinue={handleDialogContinue}
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default Step4Page;
