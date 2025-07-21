"use client";

import React, { useState, useEffect } from "react";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import GradientBorder from "@/components/ui/gradientBorder";

type Player = "X" | "O" | null;
type Board = Player[];
type GameStatus = "playing" | "won" | "draw";
type Difficulty = "easy" | "medium" | "hard";

interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player;
}

const TicTacToe: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
  });

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  const { width, height } = useWindowSize();

  // Check for winner
  const checkWinner = (board: Board): Player => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board: Board): boolean => {
    return board.every((cell) => cell !== null);
  };

  // Minimax algorithm for AI
  const minimax = React.useCallback(
    (board: Board, depth: number, isMaximizing: boolean): number => {
      const winner = checkWinner(board);

      if (winner === "O") return 10 - depth;
      if (winner === "X") return depth - 10;
      if (isBoardFull(board)) return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
            board[i] = "O";
            const score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
            board[i] = "X";
            const score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    },
    []
  );

  // Get random available move
  const getRandomMove = React.useCallback((board: Board): number => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((move) => move !== null) as number[];
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }, []);

  // Get best move for AI
  const getBestMove = React.useCallback(
    (board: Board): number => {
      let bestScore = -Infinity;
      let bestMove = 0;

      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const score = minimax(board, 0, false);
          board[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return bestMove;
    },
    [minimax]
  );

  // Get AI move based on difficulty
  const getAiMove = React.useCallback(
    (board: Board): number => {
      switch (difficulty) {
        case "easy":
          // 80% random moves, 20% optimal moves
          return Math.random() < 0.8
            ? getRandomMove(board)
            : getBestMove(board);
        case "medium":
          // 40% random moves, 60% optimal moves
          return Math.random() < 0.4
            ? getRandomMove(board)
            : getBestMove(board);
        case "hard":
          // Always optimal moves
          return getBestMove(board);
        default:
          return getBestMove(board);
      }
    },
    [difficulty, getRandomMove, getBestMove]
  );

  // Handle player move
  const handleCellClick = (index: number) => {
    if (
      gameState.board[index] ||
      gameState.status !== "playing" ||
      gameState.currentPlayer !== "X" ||
      isAiThinking
    ) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = "X";

    const winner = checkWinner(newBoard);
    const isFull = isBoardFull(newBoard);

    setGameState({
      board: newBoard,
      currentPlayer: "O",
      status: winner ? "won" : isFull ? "draw" : "playing",
      winner,
    });

    // Show result overlay if game ended
    if (winner || isFull) {
      setShowResultOverlay(true);
      setTimeout(() => setShowResultOverlay(false), 3500);
    }
  };

  // AI move effect
  useEffect(() => {
    if (gameState.currentPlayer === "O" && gameState.status === "playing") {
      setIsAiThinking(true);

      setTimeout(() => {
        const aiMove = getAiMove([...gameState.board]);
        const newBoard = [...gameState.board];
        newBoard[aiMove] = "O";

        const winner = checkWinner(newBoard);
        const isFull = isBoardFull(newBoard);

        setGameState({
          board: newBoard,
          currentPlayer: "X",
          status: winner ? "won" : isFull ? "draw" : "playing",
          winner,
        });

        // Show result overlay if game ended
        if (winner || isFull) {
          setShowResultOverlay(true);
          setTimeout(() => setShowResultOverlay(false), 4000);
        }

        setIsAiThinking(false);
      }, 1500);
    }
  }, [gameState.currentPlayer, gameState.status, gameState.board, getAiMove]);

  // Reset game
  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
    });
    setIsAiThinking(false);
    setShowResultOverlay(false);
  };

  // Get status message
  const getStatusMessage = (): string => {
    if (gameState.status === "won") {
      return gameState.winner === "X" ? "You Win! 🎉" : "AI Wins! You Lose! 🤖";
    }
    if (gameState.status === "draw") {
      return "It's a Draw! 🤝";
    }
    if (isAiThinking) {
      return "AI is thinking... 🤔";
    }
    return "Your turn (X)";
  };

  // Get large result message for overlay
  const getResultMessage = (): string => {
    if (gameState.status === "won") {
      return gameState.winner === "X" ? "YOU WIN!" : "AI WINS!";
    }
    if (gameState.status === "draw") {
      return "IT'S A DRAW!";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 p-2 sm:p-4 relative">
      {/* Show confetti when user wins */}
      {gameState.winner === "X" && (
        <Confetti
          width={width}
          height={height - 64}
          recycle={false}
          numberOfPieces={1000}
          gravity={1.0}
          initialVelocityY={30}
          initialVelocityX={5}
          className="z-100"
        />
      )}

      {/* Result Overlay */}
      {showResultOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div
            className={`text-center px-4 animate-pulse ${
              gameState.winner === "X"
                ? "text-lime-500 dark:text-lime-400"
                : gameState.winner === "O"
                  ? "text-red-500 dark:text-red-400"
                  : "text-yellow-500 dark:text-yellow-400"
            }`}
            style={{
              animation: "flash 0.8s ease-in-out 5",
            }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-wider drop-shadow-2xl">
              {getResultMessage()}
            </h1>
          </div>
        </div>
      )}

      <GradientBorder width={2}>
        <div
          className={`backdrop-blur-lg p-4 sm:p-6 shadow-2xl transition-all duration-700 sm:min-w-md ${
            gameState.winner === "X"
              ? "bg-lime-400 dark:bg-lime-900/80"
              : gameState.winner === "O"
                ? "bg-red-400/90 dark:bg-red-800/90"
                : "bg-neutral-100/70 dark:bg-neutral-900/90"
          }`}
        >
          <div className="text-center">
            <GradientText className="text-2xl sm:text-3xl">
              Tic Tac Toe
            </GradientText>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
            vs AI
          </p>

          <div className="mb-4 text-center">
            <div className="mb-3">
              <label className="block text-xs uppercase font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Difficulty
              </label>
              <div className="flex justify-center">
                <div className="bg-neutral-100 dark:bg-neutral-700  p-1 rounded-full flex items-center justify-center gap-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-3 py-1.5 w-20 text-sm font-medium transition-all duration-200 rounded-full ${
                        difficulty === level
                          ? "bg-purple-400 text-neutral-950 dark:bg-purple-800 shadow-lg dark:text-neutral-100"
                          : " text-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-200 h-6 sm:h-8">
              {getStatusMessage()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 w-52 h-52 sm:w-60 sm:h-60 mx-auto">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={isAiThinking || gameState.status !== "playing"}
                className={`
                w-[4.125rem] h-[4.125rem] sm:w-[4.75rem] sm:h-[4.75rem] bg-neutral-100 dark:bg-neutral-800 backdrop-blur-sm rounded-lg 
                border-2 border-neutral-400 dark:border-neutral-700 text-2xl sm:text-3xl font-bold
                transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center
                ${cell === "X" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}
                ${!cell && gameState.status === "playing" && !isAiThinking ? "cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600" : ""}
              `}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-3">
            <Button
              variant="action"
              onClick={resetGame}
              disabled={gameState.status === "playing"}
              className={`transition-all duration-200 ${
                gameState.status === "playing"
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100"
              }`}
            >
              New Game
            </Button>
          </div>

          <div className="text-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            <p>You are X, AI is O</p>
            <p>Click any empty cell to make your move</p>
          </div>
        </div>
      </GradientBorder>
    </div>
  );
};

export default TicTacToe;
