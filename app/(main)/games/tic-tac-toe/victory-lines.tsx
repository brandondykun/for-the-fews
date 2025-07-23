import React from "react";

import { getVictoryLineClass } from "@/lib/utils";

import type { GameState } from "./page";

const VictoryLines = ({ gameState }: { gameState: GameState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-full h-full relative">
        {/* Row lines */}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-row-1" && (
          <div
            className={`absolute top-[15.5%] left-0 w-full h-1 transform -translate-y-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-row-2" && (
          <div
            className={`absolute top-1/2 left-0 w-full h-1 transform -translate-y-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-row-3" && (
          <div
            className={`absolute top-[85.5%] left-0 w-full h-1 transform -translate-y-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}

        {/* Column lines */}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-col-1" && (
          <div
            className={`absolute left-[16%] top-0 w-1 h-full transform -translate-x-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-col-2" && (
          <div
            className={`absolute left-1/2 top-0 w-1 h-full transform -translate-x-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-col-3" && (
          <div
            className={`absolute left-[84.5%] top-0 w-1 h-full transform -translate-x-1/2 ${
              gameState.winner === "X"
                ? "bg-lime-500 dark:bg-lime-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
          ></div>
        )}

        {/* Diagonal lines */}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-diagonal-1" && (
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`absolute top-1/2 left-1/2 w-[141.42%] h-1 transform -translate-x-1/2 -translate-y-1/2 rotate-45 origin-center ${
                gameState.winner === "X"
                  ? "bg-lime-500 dark:bg-lime-400"
                  : "bg-red-500 dark:bg-red-400"
              }`}
            ></div>
          </div>
        )}
        {getVictoryLineClass(gameState.winningPattern) ===
          "victory-line-diagonal-2" && (
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`absolute top-1/2 left-1/2 w-[141.42%] h-1 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 origin-center ${
                gameState.winner === "X"
                  ? "bg-lime-500 dark:bg-lime-400"
                  : "bg-red-500 dark:bg-red-400"
              }`}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryLines;
