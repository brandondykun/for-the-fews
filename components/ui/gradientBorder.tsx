"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface GradientBorderProps {
  children: React.ReactNode;
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

export function GradientBorder({
  children,
  width = 1,
  className,
  rounded = true,
  roundedSize = "lg",
  defaultBorderColor = "bg-neutral-200 dark:bg-neutral-700",
  showGradientBorder = true,
  ...props
}: GradientBorderProps) {
  const roundedClass = rounded ? roundedMap[roundedSize] : roundedMap.none;
  const widthClass = widthMap[width];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        widthClass,
        roundedClass,
        showGradientBorder
          ? "bg-linear-to-br/increasing dark:from-red-700 dark:via-lime-300 dark:to-violet-700 from-red-500 via-lime-500 to-violet-500"
          : defaultBorderColor,
        className
      )}
      {...props}
    >
      {/* Content */}
      <div className={cn("relative z-10 overflow-hidden", roundedClass)}>
        {children}
      </div>
    </div>
  );
}

export default GradientBorder;
