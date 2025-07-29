"use client";

import React, { useState, useEffect, useRef } from "react";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import GradientBorder from "@/components/ui/gradientBorder";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { formatMoney, formatMoneyFull, formatTime } from "@/lib/utils";

type GameStatus = "ready" | "playing" | "won" | "lost" | "loading";

interface PriceResponse {
  itemKey: string;
  price: number;
  formattedPrice: string;
  aiResponse?: string;
  error?: string;
}

const SpendItGame: React.FC = () => {
  const { user } = useAuth();
  const [moneyLeft, setMoneyLeft] = useState(1000000000000); // $1 trillion
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [currentItem, setCurrentItem] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<PriceResponse | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PriceResponse[]>([]);
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  const { width, height } = useWindowSize();
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate total spent
  const getTotalSpent = (): number => {
    return purchaseHistory.reduce(
      (total, purchase) => total + purchase.price,
      0
    );
  };

  // Call spend-it API
  const getPriceEstimate = async (itemKey: string): Promise<PriceResponse> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();
    const response = await fetch("/api/spend-it", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ itemKey }),
    });

    if (!response.ok) {
      throw new Error("Failed to get price estimate");
    }

    return response.json();
  };

  // Handle item submission
  const handleSubmitItem = async () => {
    if (!currentItem.trim() || isSubmitting || gameStatus !== "playing") {
      return;
    }

    setIsSubmitting(true);

    try {
      const priceData = await getPriceEstimate(currentItem.trim());
      const newMoneyLeft = moneyLeft - priceData.price;

      // If price is $0, add 5 seconds back to timer as compensation
      if (priceData.price === 0) {
        setTimeLeft((prev) => prev + 5);
        toast.info("🎁 Added 5 seconds for $0 price");
      }

      setMoneyLeft(Math.max(0, newMoneyLeft));
      setLastPurchase(priceData);
      setPurchaseHistory((prev) => [priceData, ...prev]); // Keep all purchases
      setCurrentItem("");

      // Check win condition
      if (newMoneyLeft <= 0) {
        setGameStatus("won");
        setShowResultOverlay(true);
        setTimeout(() => setShowResultOverlay(false), 4000);
      }
    } catch (error) {
      devError("Error getting price estimate:", error);
    } finally {
      setIsSubmitting(false);
      // Focus the input field after response
      setTimeout(() => {
        if (inputRef.current && gameStatus === "playing") {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitItem();
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const timer = setInterval(() => {
      // Only decrease timer if not currently submitting an API request
      if (!isSubmitting) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameStatus("lost");
            setShowResultOverlay(true);
            setTimeout(() => setShowResultOverlay(false), 4000);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, isSubmitting]);

  // Start game function
  const startGame = () => {
    setGameStatus("playing");
    // Focus input when game starts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Reset game
  const resetGame = () => {
    setMoneyLeft(1000000000000);
    setTimeLeft(180);
    setCurrentItem("");
    setGameStatus("ready");
    setIsSubmitting(false);
    setLastPurchase(null);
    setPurchaseHistory([]);
    setShowResultOverlay(false);
  };

  // Get status message
  const getStatusMessage = (): string => {
    if (gameStatus === "ready") {
      return "Ready to start spending! 💰";
    }
    if (gameStatus === "won") {
      return "🎉 Congratulations! You spent it all! 🎉";
    }
    if (gameStatus === "lost") {
      return "⏰ Time's up! You lose! 💸";
    }
    if (isSubmitting) {
      return "Getting price estimate... 💭";
    }
    return "Type an item and spend your money! 💰";
  };

  // Get result message for overlay
  const getResultMessage = (): string => {
    if (gameStatus === "won") {
      return "YOU WIN!";
    }
    if (gameStatus === "lost") {
      return "TIME'S UP!";
    }
    return "";
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700 relative pb-8">
      {/* Show confetti when user wins */}
      {gameStatus === "won" && (
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
            className={`text-center px-4 animate-flash ${
              gameStatus === "won"
                ? "text-lime-500 dark:text-lime-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-wider drop-shadow-2xl">
              {getResultMessage()}
            </h1>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 mb-4 md:mb-12">
        <div className="md:flex md:flex-row items-center justify-between text-center md:text-left">
          <GradientText className="text-2xl sm:text-3xl lg:text-4xl mb-3 md:mb-0">
            Spend It!
          </GradientText>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Spend $1 trillion in 3 minutes to win!
          </p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Game Stats - Full Width */}
        <div className="mb-8  md:w-xl mx-auto">
          <GradientBorder width={1} className="w-full">
            <div className={`p-0 text-center rounded-[12px] w-full`}>
              <div className="p-0">
                <div
                  className={`p-3 sm:p-4 text-center transition-all duration-700 rounded-[12px] ${
                    gameStatus === "won"
                      ? "bg-lime-400/90 dark:bg-lime-900/80"
                      : gameStatus === "lost"
                        ? "bg-red-400/90 dark:bg-red-800/90"
                        : "bg-neutral-100/90 dark:bg-neutral-900/95"
                  }`}
                >
                  <div className="mb-8">
                    <div className="text-sm uppercase font-bold tracking-wide text-neutral-700 dark:text-neutral-400">
                      Money Left
                    </div>
                    <div
                      className={`text-xl xs:text-2xl sm:text-3xl font-bold ${
                        moneyLeft <= 0
                          ? "text-lime-600 dark:text-lime-400"
                          : "text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {formatMoneyFull(moneyLeft)}
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <div className="text-sm uppercase font-bold tracking-wide text-neutral-700 dark:text-neutral-400 mb-1">
                        Total Spent
                      </div>
                      <div className="text-lg text-left xs:text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {formatMoney(getTotalSpent())}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm uppercase font-bold tracking-wide text-neutral-700 dark:text-neutral-400 mb-1">
                        Time Left
                      </div>
                      <div
                        className={`text-lg text-right xs:text-xl sm:text-3xl font-bold ${
                          timeLeft <= 30
                            ? "text-red-600 dark:text-red-400"
                            : "text-neutral-800 dark:text-neutral-200"
                        } ${isSubmitting ? "opacity-50" : "opacity-100"} transition-opacity duration-300`}
                      >
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GradientBorder>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-4xl lg:mx-auto">
          {/* Left Column - Game Controls */}
          <div className="mb-8">
            <Card className="p-6 bg-neutral-100/80 dark:bg-neutral-900/80">
              <CardContent className="p-0">
                {/* Status Message */}
                <div className="text-center mb-6">
                  <div className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                    {getStatusMessage()}
                  </div>
                </div>

                {/* Start Button */}
                {gameStatus === "ready" && (
                  <div className="flex justify-center mb-6">
                    <Button
                      onClick={startGame}
                      variant="action"
                      className="px-8 py-4 text-xl font-bold"
                    >
                      🚀 Start Game
                    </Button>
                  </div>
                )}

                {/* Input Section */}
                {gameStatus === "playing" && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Type any item (e.g., 'iPhone', 'car', 'house')"
                        value={currentItem}
                        onChange={(e) => setCurrentItem(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSubmitting}
                        className="flex-1 text-lg p-4"
                      />
                      <Button
                        onClick={handleSubmitItem}
                        disabled={!currentItem.trim() || isSubmitting}
                        variant="action"
                        className="px-6 py-4 text-lg"
                      >
                        {isSubmitting ? "Getting Price..." : "Buy It!"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Last Purchase */}
                {lastPurchase && gameStatus === "playing" && (
                  <div className="mb-6 p-4 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-lg">
                    <div className="text-base font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Last Purchase:
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-neutral-800 dark:text-neutral-200">
                        {lastPurchase.itemKey}
                      </span>
                      <span className="text-xl font-black text-green-600 dark:text-green-400">
                        -{formatMoneyFull(lastPurchase.price)}
                      </span>
                    </div>
                    {lastPurchase.error && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                        ⚠️ {lastPurchase.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Reset Button */}
                {(gameStatus === "won" || gameStatus === "lost") && (
                  <div className="flex justify-center">
                    <Button
                      variant="action"
                      onClick={resetGame}
                      className="px-8 py-4 text-lg"
                    >
                      Play Again
                    </Button>
                  </div>
                )}

                {/* Instructions */}
                {gameStatus === "ready" && (
                  <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
                    <p className="mb-1">
                      You have $1 trillion to spend in 3 minutes!
                    </p>
                    <p className="mb-1">
                      Enter any item and we&apos;ll estimate its price! If we
                      can&apos;t, we&apos;ll add 5 seconds back on the clock.
                    </p>
                    <p>Click Start Game to begin the countdown!</p>
                  </div>
                )}

                {gameStatus === "playing" && (
                  <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
                    <p className="mb-1">
                      Enter any item and we&apos;ll estimate its price!
                    </p>
                    <p>Spend all your money before time runs out to win!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <Card className="p-6 bg-neutral-100/80 dark:bg-neutral-900/80">
            <CardContent className="p-0">
              <div className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Purchase History
              </div>

              {purchaseHistory.length > 0 ? (
                <>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                    {purchaseHistory.length} items purchased
                  </div>
                  <div className="space-y-2">
                    {purchaseHistory.map((purchase, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-lg"
                      >
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                          {purchase.itemKey}
                        </span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400 ml-2 whitespace-nowrap">
                          -{formatMoneyFull(purchase.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                  <p className="text-lg mb-2">🛒</p>
                  <p>No purchases yet</p>
                  <p className="text-sm">
                    Start buying items to see them here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpendItGame;
