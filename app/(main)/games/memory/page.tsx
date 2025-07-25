"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available symbols for the game (20 unique symbols to support up to 20 pairs)
const allSymbols = [
  "🎮",
  "🎯",
  "🥝",
  "🎪",
  "🎭",
  "🎨",
  "🎸",
  "⚽",
  "🏀",
  "🎲",
  "🎵",
  "🎬",
  "🍎",
  "🌟",
  "🚀",
  "🎈",
  "🎊",
  "🎉",
  "🏆",
  "💎",
];

const MemoryGame = () => {
  // Create pairs of cards based on selected number of pairs
  const createCards = useCallback((numPairs: number) => {
    const selectedSymbols = allSymbols.slice(0, numPairs);
    const pairs = selectedSymbols.concat(selectedSymbols);
    return pairs
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5); // Shuffle cards
  }, []);

  const { width, height } = useWindowSize();
  const parentDivRef = useRef<HTMLDivElement>(null);
  const [parentHeight, setParentHeight] = useState(height - 64);

  const [pairsCount, setPairsCount] = useState(10);
  const [cards, setCards] = useState(() => createCards(10));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Check if all cards are matched
  const allMatched = useMemo(() => {
    return cards.every((card) => card.isMatched);
  }, [cards]);

  // Handle game win
  useEffect(() => {
    if (allMatched && gameStarted && cards.length > 0) {
      setGameWon(true);
    }
  }, [allMatched, gameStarted, cards.length]);

  // Handle card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      setGuesses((prev) => prev + 1);

      // Find the actual cards by their IDs
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match - flip cards back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  // Update parent height after render and on resize
  useEffect(() => {
    const updateParentHeight = () => {
      if (parentDivRef.current) {
        setParentHeight(parentDivRef.current.offsetHeight);
      } else {
        setParentHeight(height - 64); // fallback
      }
    };

    // Initial calculation
    updateParentHeight();

    // Update on window resize
    window.addEventListener("resize", updateParentHeight);

    return () => {
      window.removeEventListener("resize", updateParentHeight);
    };
  }, [height]);

  const startGame = () => {
    setGameStarted(true);
    setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })));
  };

  const resetGame = () => {
    setCards(createCards(pairsCount));
    setFlippedCards([]);
    setGameStarted(false);
    setGuesses(0);
    setGameWon(false);
  };

  const handlePairsChange = (newPairsCount: number) => {
    setPairsCount(newPairsCount);
    setCards(createCards(newPairsCount));
    setFlippedCards([]);
    setGameStarted(false);
    setGuesses(0);
    setGameWon(false);
  };

  // Get responsive grid layout based on number of cards
  const getGridLayout = (numCards: number) => {
    switch (numCards) {
      case 20:
        return "grid-cols-4 lg:grid-cols-5"; // 4x5
      case 24:
        return "grid-cols-4 lg:grid-cols-6"; // 4x6
      case 30:
        return "grid-cols-5 lg:grid-cols-6"; // 5x6
      case 36:
        return "grid-cols-6"; // 6x6
      default:
        return "grid-cols-4 lg:grid-cols-5";
    }
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || flippedCards.length >= 2) return;

    // Find the card by its ID, not by using ID as array index
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    if (card.isFlipped || card.isMatched || flippedCards.includes(cardId))
      return;

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, cardId]);
  };

  return (
    <div
      ref={parentDivRef}
      className="min-h-[calc(100dvh-64px)] bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
    >
      {/* Show confetti when user wins */}
      {gameWon && (
        <Confetti
          width={width}
          height={parentHeight}
          recycle={false}
          numberOfPieces={1000}
          gravity={1.0}
          initialVelocityY={30}
          initialVelocityX={5}
          className="z-100"
        />
      )}

      {/* Main Layout - Mobile: Stacked, MD+: Sidebar */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-0 min-h-[calc(100dvh-64px)]">
        {/* Sidebar for MD+ screens, top section for mobile */}
        <aside className="md:w-70 bg-neutral-200 dark:bg-neutral-800 p-4 flex flex-col">
          {/* Game Title and Subtitle */}
          <div className="text-center mb-8 md:text-left">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Memory Game
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Find all the matching pairs!
            </p>
          </div>

          {/* Pairs Count Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Number of Pairs
            </label>
            <Select
              value={pairsCount.toString()}
              onValueChange={(value) => handlePairsChange(Number(value))}
              disabled={gameStarted}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select number of pairs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 pairs (20 cards)</SelectItem>
                <SelectItem value="12">12 pairs (24 cards)</SelectItem>
                <SelectItem value="15">15 pairs (30 cards)</SelectItem>
                <SelectItem value="18">18 pairs (36 cards)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex md:flex-col justify-center items-center gap-4 md:gap-2 mb-6">
            <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 rounded-lg">
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
                Guesses: {guesses}
              </span>
            </div>
            <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 rounded-lg">
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
                Pairs Found:{" "}
                {Math.floor(cards.filter((card) => card.isMatched).length / 2)}/
                {pairsCount}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex md:flex-col justify-center gap-4 md:flex-1 md:justify-between mb-6 md:mb-0">
            <Button
              onClick={!gameStarted ? startGame : resetGame}
              variant={!gameStarted ? "default" : "outline"}
            >
              {!gameStarted ? "Start Game" : "Reset Game"}
            </Button>
            {!gameStarted && (
              <Button onClick={resetGame} variant="link">
                Shuffle Cards
              </Button>
            )}
          </div>

          {/* Help Button */}
          <div className="flex justify-center items-end md:justify-start">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10"
                  aria-label="Show help"
                >
                  ?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to Play</DialogTitle>
                </DialogHeader>
                <div className="text-neutral-600 dark:text-neutral-400 space-y-2">
                  <p>1. Click &quot;Start Game&quot; to hide all cards</p>
                  <p>2. Click on cards to flip them and find matching pairs</p>
                  <p>3. Match all pairs to win the game!</p>
                  <p>4. Try to complete it in as few guesses as possible</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </aside>

        {/* Main Game Area */}
        <div className="flex-1 md:max-w-3xl md:mx-auto">
          {/* Game Board */}
          <div
            className={`grid ${getGridLayout(cards.length)} gap-4 mb-8 overflow-y-auto p-4 sm:p-8 md:p-12`}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() =>
                  card.isMatched ? null : handleCardClick(card.id)
                }
                className={`
                    aspect-square rounded-lg transition-all duration-300
                    ${
                      card.isMatched
                        ? "bg-neutral-100 dark:bg-neutral-800 opacity-50"
                        : card.isFlipped || !gameStarted
                          ? "bg-neutral-200 dark:bg-neutral-700 shadow-lg cursor-pointer transform hover:scale-105"
                          : "bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500 shadow-md cursor-pointer transform hover:scale-105"
                    }
                  `}
              >
                <div className="w-full h-full flex items-center justify-center text-2xl xs:text-3xl sm:text-4xl lg:text-5xl">
                  {card.isMatched ? (
                    <div className="w-6 h-6 bg-green-400 dark:bg-green-600 rounded-full opacity-60"></div>
                  ) : card.isFlipped || !gameStarted ? (
                    <span className="animate-pulse">{card.symbol}</span>
                  ) : (
                    <div className="w-8 h-8 bg-neutral-400 dark:bg-neutral-500 rounded"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Win Message Popup */}
          {gameWon && (
            <div className="fixed inset-0 bg-neutral-500/50 dark:bg-neutral-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-6 max-w-md w-full mx-4 relative animate-in fade-in zoom-in-95 duration-300">
                <button
                  onClick={() => setGameWon(false)}
                  className="absolute top-4 right-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-xl font-bold"
                  aria-label="Close congratulations"
                >
                  ×
                </button>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                    🎉 Congratulations! 🎉
                  </h2>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    You found all pairs in{" "}
                    <span className="font-bold">{guesses}</span> guesses!
                  </p>
                  <Button
                    onClick={() => setGameWon(false)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Continue Playing
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
