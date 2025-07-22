import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserStatus } from "@/types";

interface Props {
  status: UserStatus;
  tooltipSide?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const UserStatusIcon = ({
  status,
  tooltipSide = "right",
  className,
}: Props) => {
  let tooltipText = "Offline and inactive";

  const sharedStyles = "h-3 w-3 rounded-full";

  // Default is offline
  let content = (
    <div
      className={cn(
        sharedStyles,
        "border-2 border-neutral-400 dark:border-neutral-500",
        className
      )}
    />
  );

  if (status === "online") {
    content = (
      <div
        className={cn(sharedStyles, "bg-green-400 dark:bg-lime-500", className)}
      />
    );
    tooltipText = "Online and active";
  }

  if (status === "brb") {
    content = (
      <div
        className={cn(
          sharedStyles,
          "bg-orange-400 dark:bg-orange-600",
          className
        )}
      />
    );
    tooltipText = "Be right back";
  }

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default UserStatusIcon;
