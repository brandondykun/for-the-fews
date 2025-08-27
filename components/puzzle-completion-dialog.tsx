"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle,
  PartyPopper,
  Trophy,
  Star,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PuzzleCompletionDialogProps {
  isOpen: boolean;
  stepNumber: number;
  onClose?: () => void;
  onContinue?: () => void | Promise<void>;
}

const stepMessages = {
  1: {
    title: "Great Job!",
    message:
      "You found the hidden button! Sometimes the best solutions are hiding in plain sight.",
    icon: CheckCircle,
  },
  2: {
    title: "Excellent Work!",
    message:
      "You discovered the key to success! Persistence really does pay off.",
    icon: Target,
  },
  3: {
    title: "Amazing!",
    message:
      "You caught the elusive button! Quick thinking and creativity are your strengths.",
    icon: Star,
  },
  4: {
    title: "Fantastic!",
    message:
      "You completed the quick clicks challenge! Your focus and speed are impressive.",
    icon: Trophy,
  },
  5: {
    title: "Outstanding!",
    message:
      "You solved the pattern puzzle! Your attention to detail is remarkable.",
    icon: Sparkles,
  },
  6: {
    title: "Incredible!",
    message:
      "Skibity Toilet! You deciphered the message! You've proven yourself as a true puzzle rizzler.",
    icon: PartyPopper,
  },
};

export const PuzzleCompletionDialog: React.FC<PuzzleCompletionDialogProps> = ({
  isOpen,
  stepNumber,
  onClose,
  onContinue,
}) => {
  const router = useRouter();
  const stepData = stepMessages[stepNumber as keyof typeof stepMessages];
  const IconComponent = stepData?.icon || CheckCircle;
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (onContinue) {
      setIsLoading(true);
      try {
        await onContinue();
      } finally {
        setIsLoading(false);
      }
    } else {
      if (onClose) {
        onClose();
      }
    }
    // Navigate back to puzzle home
    router.push("/games/puzzle");
  };

  if (!stepData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onKeyDown={(e) => {
          // Prevent space bar and other key events from bubbling up
          if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onKeyUp={(e) => {
          // Prevent space bar and other key events from bubbling up
          if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
            {stepData.title}
          </DialogTitle>
          <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mt-2">
            {stepData.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-center">
          <Button
            onClick={handleContinue}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
