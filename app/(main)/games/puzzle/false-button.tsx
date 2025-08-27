"use client";

import React, { useState } from "react";

import PuzzleDialog from "@/components/puzzle-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FalseButtonProps {
  title: string;
  description: string;
  buttonText: string;
  dialogButtonText?: string;
  buttonClassName?: string;
  variant?: "outline" | "default";
}

const FalseButton = ({
  title,
  description,
  buttonText,
  dialogButtonText = "Continue",
  buttonClassName = "",
  variant = "outline",
}: FalseButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        className={cn("hover:cursor-pointer", buttonClassName)}
        onClick={() => setDialogOpen(true)}
      >
        {buttonText}
      </Button>
      <PuzzleDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        title={title}
        description={description}
        continueButtonText={dialogButtonText}
      />
    </>
  );
};

export default FalseButton;
