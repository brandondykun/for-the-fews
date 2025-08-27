"use client";

import React, { useState, useEffect } from "react";

import { PuzzleCompletionDialog } from "@/components/puzzle-completion-dialog";
import { PuzzleRouteGuard } from "@/components/puzzle-route-guard";
import { usePuzzleProgressContext } from "@/context/puzzle-progress-context";
import { usePuzzleProgress } from "@/hooks/usePuzzleProgress";
import { cn } from "@/lib/utils";

const fixedSquareColors = {
  // Main square
  main: "bg-blue-500",
  // 4 Secondary squares
  secondaryOne: "bg-green-500",
  secondaryTwo: "bg-purple-500",
  secondaryThree: "bg-teal-500",
  secondaryFour: "bg-lime-500",
  // 4 squares in top left square
  tertiaryOne: "bg-neutral-500",
  tertiaryTwo: "bg-cyan-500",
  tertiaryThree: "bg-orange-500",
  tertiaryFour: "bg-pink-500",
  // 4 squares in top right square
  tertiaryFive: "bg-neutral-500",
  tertiarySix: "bg-cyan-500",
  tertiarySeven: "bg-orange-500",
  tertiaryEight: "bg-pink-500",
  // 4 squares in bottom left square
  tertiaryNine: "bg-neutral-500",
  tertiaryTen: "bg-cyan-500",
  tertiaryEleven: "bg-orange-500",
  tertiaryTwelve: "bg-pink-500",
  // 4 squares in bottom right square
  tertiaryThirteen: "bg-neutral-500",
  tertiaryFourteen: "bg-cyan-500",
  tertiaryFifteen: "bg-orange-500",
  tertiarySixteen: "bg-pink-500",
};

const colorOptions = {
  // Main square
  main: ["bg-blue-500", "bg-red-500"],
  // 4 Secondary squares
  secondaryOne: ["bg-green-500", "bg-rose-800"],
  secondaryTwo: ["bg-purple-500", "bg-lime-500"],
  secondaryThree: ["bg-teal-500", "bg-purple-400"],
  secondaryFour: ["bg-lime-500", "bg-stone-300"],
  // 4 squares in top left square
  tertiaryOne: ["bg-neutral-500", "bg-indigo-500"],
  tertiaryTwo: ["bg-cyan-500", "bg-orange-500"],
  tertiaryThree: ["bg-orange-500", "bg-pink-500"],
  tertiaryFour: ["bg-pink-500", "bg-neutral-500"],
  // 4 squares in top right square
  tertiaryFive: ["bg-neutral-500", "bg-fuchsia-500"],
  tertiarySix: ["bg-cyan-500", "bg-teal-500"],
  tertiarySeven: ["bg-orange-500", "bg-indigo-500"],
  tertiaryEight: ["bg-pink-500", "bg-green-500"],
  // 4 squares in bottom left square
  tertiaryNine: ["bg-neutral-500", "bg-fuchsia-500"],
  tertiaryTen: ["bg-cyan-500", "bg-rose-500"],
  tertiaryEleven: ["bg-orange-500", "bg-amber-400"],
  tertiaryTwelve: ["bg-pink-500", "bg-sky-500"],
  // 4 squares in bottom right square
  tertiaryThirteen: ["bg-neutral-500", "bg-purple-500"],
  tertiaryFourteen: ["bg-cyan-500", "bg-orange-500"],
  tertiaryFifteen: ["bg-orange-500", "bg-sky-500"],
  tertiarySixteen: ["bg-pink-500", "bg-red-500"],
};

const Step5Page = () => {
  const { completeStep } = usePuzzleProgress();
  const { refreshProgress, isStepCompleted } = usePuzzleProgressContext();

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [colors, setColors] = useState({
    // Main square
    main: "bg-red-500",
    // 4 Secondary squares
    secondaryOne: "bg-rose-800",
    secondaryTwo: "bg-purple-500",
    secondaryThree: "bg-purple-400",
    secondaryFour: "bg-stone-300",
    // 4 squares in top left square
    tertiaryOne: "bg-indigo-500",
    tertiaryTwo: "bg-orange-500",
    tertiaryThree: "bg-pink-500",
    tertiaryFour: "bg-neutral-500",
    // 4 squares in top right square
    tertiaryFive: "bg-fuchsia-500",
    tertiarySix: "bg-teal-500",
    tertiarySeven: "bg-indigo-500",
    tertiaryEight: "bg-green-500",
    // 4 squares in bottom left square
    tertiaryNine: "bg-fuchsia-500",
    tertiaryTen: "bg-rose-500",
    tertiaryEleven: "bg-amber-400",
    tertiaryTwelve: "bg-sky-500",
    // 4 squares in bottom right square
    tertiaryThirteen: "bg-purple-500",
    tertiaryFourteen: "bg-orange-500",
    tertiaryFifteen: "bg-sky-500",
    tertiarySixteen: "bg-red-500",
  });

  const handleDialogContinue = async () => {
    // If step is already completed, just close dialog
    if (isStepCompleted(5)) {
      setShowCompletionDialog(false);
      return;
    }

    // Otherwise, complete the step and update backend
    const success = await completeStep(5);
    if (success) {
      // Refresh context data after completion
      await refreshProgress();
    }
    setShowCompletionDialog(false);
  };

  const handleColorChange = (squareKey: keyof typeof colors) => {
    setColors((prev) => {
      const currentColor = prev[squareKey];
      const newColor =
        colorOptions[squareKey][0] === currentColor
          ? colorOptions[squareKey][1]
          : colorOptions[squareKey][0];
      return {
        ...prev,
        [squareKey]: newColor,
      };
    });
  };

  // Check if colors match the fixed pattern
  useEffect(() => {
    const colorsMatch = Object.keys(fixedSquareColors).every(
      (key) =>
        colors[key as keyof typeof colors] ===
        fixedSquareColors[key as keyof typeof fixedSquareColors]
    );

    if (colorsMatch) {
      setTimeout(() => {
        // Always show dialog immediately for better UX
        setShowCompletionDialog(true);
      }, 1000);
    }
  }, [colors, completeStep]);

  return (
    <PuzzleRouteGuard stepNumber={5}>
      <main className="p-6 h-[calc(100vh-65px)] relative cursor-default flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center mb-4">The Pattern</h1>
        <h2 className="text-center dark:text-neutral-400 mb-4">
          Match the colors. Clicking on the squares on the right will change the
          colors of the squares. Click the squares until all the colors on the
          right match all the colors on the left.
        </h2>
        <p className="text-center text-sky-600 dark:text-sky-500">
          Beware, the colors change in funny ways.
        </p>
        <div className="mt-8 flex flex-1 w-full gap-8 px-4">
          <div
            className={cn(
              "flex-1 grid grid-cols-2 grid-rows-2 p-4 gap-4 rounded-lg",
              fixedSquareColors.main
            )}
          >
            <div
              className={cn(
                "flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                fixedSquareColors.secondaryOne
              )}
            >
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryOne)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryTwo)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryThree)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryFour)}
              ></div>
            </div>
            <div
              className={cn(
                "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                fixedSquareColors.secondaryTwo
              )}
            >
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryFive)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiarySix)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiarySeven)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryEight)}
              ></div>
            </div>
            <div
              className={cn(
                "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                fixedSquareColors.secondaryThree
              )}
            >
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryNine)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryTen)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryEleven)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryTwelve)}
              ></div>
            </div>
            <div
              className={cn(
                "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                fixedSquareColors.secondaryFour
              )}
            >
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryThirteen)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryFourteen)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiaryFifteen)}
              ></div>
              <div
                className={cn("rounded-lg", fixedSquareColors.tertiarySixteen)}
              ></div>
            </div>
          </div>
          <div className="flex flex-1">
            <div
              className={cn(
                "flex-1 grid grid-cols-2 grid-rows-2 p-4 gap-4 rounded-lg",
                colors.main
              )}
              onClick={() => handleColorChange("main")}
            >
              <div
                className={cn(
                  "flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                  colors.secondaryOne
                )}
                onClick={() => handleColorChange("secondaryOne")}
              >
                <div
                  className={cn("rounded-lg", colors.tertiaryOne)}
                  onClick={() => handleColorChange("tertiaryOne")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryTwo)}
                  onClick={() => handleColorChange("tertiaryTwo")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryThree)}
                  onClick={() => handleColorChange("tertiaryThree")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryFour)}
                  onClick={() => handleColorChange("tertiaryFour")}
                ></div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                  colors.secondaryTwo
                )}
                onClick={() => handleColorChange("secondaryTwo")}
              >
                <div
                  className={cn("rounded-lg", colors.tertiaryFive)}
                  onClick={() => handleColorChange("tertiaryFive")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiarySix)}
                  onClick={() => handleColorChange("tertiarySix")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiarySeven)}
                  onClick={() => handleColorChange("tertiarySeven")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryEight)}
                  onClick={() => handleColorChange("tertiaryEight")}
                ></div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                  colors.secondaryThree
                )}
                onClick={() => handleColorChange("secondaryThree")}
              >
                <div
                  className={cn("rounded-lg", colors.tertiaryNine)}
                  onClick={() => handleColorChange("tertiaryNine")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryTen)}
                  onClick={() => handleColorChange("tertiaryTen")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryEleven)}
                  onClick={() => handleColorChange("tertiaryEleven")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryTwelve)}
                  onClick={() => handleColorChange("tertiaryTwelve")}
                ></div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-2 grid-rows-2 gap-4 p-4 rounded-lg",
                  colors.secondaryFour
                )}
                onClick={() => handleColorChange("secondaryFour")}
              >
                <div
                  className={cn("rounded-lg", colors.tertiaryThirteen)}
                  onClick={() => handleColorChange("tertiaryThirteen")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryFourteen)}
                  onClick={() => handleColorChange("tertiaryFourteen")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiaryFifteen)}
                  onClick={() => handleColorChange("tertiaryFifteen")}
                ></div>
                <div
                  className={cn("rounded-lg", colors.tertiarySixteen)}
                  onClick={() => handleColorChange("tertiarySixteen")}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <PuzzleCompletionDialog
          isOpen={showCompletionDialog}
          stepNumber={5}
          onContinue={handleDialogContinue}
        />
      </main>
    </PuzzleRouteGuard>
  );
};

export default Step5Page;
