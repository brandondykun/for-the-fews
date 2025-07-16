import React from "react";

import { cn } from "@/lib/utils";
import { UserDocument } from "@/types";

const UserIcon = ({
  user,
  className,
}: {
  user: UserDocument;
  className?: string;
}) => {
  let initials = "";

  if (user.displayName.length === 1) {
    initials = user.displayName;
  } else {
    const nameParts = user.displayName.split(" ");
    if (nameParts.length > 1) {
      initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
    } else {
      initials = nameParts[0][0] + nameParts[0][1];
    }
  }

  return (
    <div
      className={cn(
        "h-9 w-9 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center",
        className
      )}
    >
      <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        {initials.toUpperCase()}
      </span>
    </div>
  );
};

export default UserIcon;
