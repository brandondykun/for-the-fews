"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface GradientBorderProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  conicDirection?:
    | "to-t"
    | "to-r"
    | "to-b"
    | "to-l"
    | "to-tr"
    | "to-tl"
    | "to-br"
    | "to-bl";
  width?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16;
  className?: string;
  rounded?: boolean;
  roundedSize?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  rotate?: boolean;
  rotationSpeed?: "slow" | "normal" | "fast";
  defaultBorderColor?: string;
  showGradientBorder?: boolean;
}

const roundedMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

const widthMap = {
  0: "p-0",
  1: "p-[1px]",
  2: "p-[2px]",
  3: "p-[3px]",
  4: "p-[4px]",
  5: "p-[5px]",
  6: "p-[6px]",
  7: "p-[7px]",
  8: "p-[8px]",
  9: "p-[9px]",
  10: "p-[10px]",
  11: "p-[11px]",
  12: "p-[12px]",
  13: "p-[13px]",
  14: "p-[14px]",
  15: "p-[15px]",
  16: "p-[16px]",
};

const rotationSpeedMap = {
  slow: "animate-spin [animation-duration:8s]",
  normal: "animate-spin [animation-duration:4s]",
  fast: "animate-spin [animation-duration:3s]",
  fastest: "animate-spin [animation-duration:2s]",
};

export function GradientBorder({
  children,
  width = 1,
  className,
  rounded = true,
  roundedSize = "lg",
  rotate = false,
  rotationSpeed = "normal",
  defaultBorderColor = "bg-neutral-200 dark:bg-neutral-700",
  showGradientBorder = true,
  ...props
}: GradientBorderProps) {
  const roundedClass = rounded ? roundedMap[roundedSize] : roundedMap.none;
  const widthClass = widthMap[width];
  const rotationClass = rotate ? rotationSpeedMap[rotationSpeed] : "";

  // Build conic gradient

  return (
    <div
      className={cn(
        "relative bg-neutral-100 overflow-hidden",
        widthClass,
        roundedClass,
        defaultBorderColor
      )}
      {...props}
    >
      {/* Rotating gradient border */}
      {showGradientBorder && (
        <div
          className={cn(
            "absolute -top-[500px] -left-[500px] -right-[500px] -bottom-[500px] w-100vw h-100vh bg-conic/decreasing dark:from-violet-700 dark:via-lime-300 dark:to-violet-700 from-violet-500 via-lime-500 to-violet-500",
            roundedClass,
            rotationClass,
            className
          )}
        ></div>
      )}

      {/* Stationary content */}
      <div className={cn("relative z-10 overflow-hidden", roundedClass)}>
        {children}
      </div>
    </div>
  );
}

export default GradientBorder;
