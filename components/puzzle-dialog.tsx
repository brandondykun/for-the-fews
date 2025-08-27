import React from "react";

import { X } from "lucide-react";

import { Button } from "./ui/button";

interface PuzzleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  continueButtonText?: string;
}

const PuzzleDialog = ({
  open,
  setOpen,
  title,
  description,
  continueButtonText = "Continue Game",
}: PuzzleDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full h-full bg-background border rounded-lg shadow-lg flex flex-col items-center justify-center relative p-8">
          {/* Close button positioned in top right */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X />
            <span className="sr-only">Close</span>
          </button>

          {/* Centered content */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-semibold">{title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
            <Button onClick={() => setOpen(false)} className="mt-8">
              {continueButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleDialog;
