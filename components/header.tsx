"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "firebase/auth";
import { ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { useUserActivity } from "@/hooks/use-user-activity";
import { devError } from "@/lib/dev-utils";
import { auth } from "@/lib/firebase";
import { updateUserStatus } from "@/lib/user-status";
import { getUserDisplayName, getUserEmail } from "@/lib/utils";
import { UserStatus } from "@/types";

import UserIcon from "./ui/userIcon";
import UserStatusIcon from "./ui/userStatusIcon";

interface HeaderProps {
  title: string;
  backButtonUrl?: string;
  backButtonText?: string;
}

export default function Header({
  title,
  backButtonUrl = "/dashboard",
  backButtonText = "Back to Dashboard",
}: HeaderProps) {
  const { user, userDocument } = useAuth();
  const pathname = usePathname();

  useUserActivity({ user, inactivityTimeout: 5 * ONE_MINUTE_IN_MS }); // 5 minutes

  const handleLogout = async () => {
    try {
      // Set user status to offline before signing out
      const result = await updateUserStatus(user, "offline");
      if (!result.success) {
        devError("Failed to update user status to offline:", result.error);
        // Continue with logout even if status update fails
      }
      await signOut(auth);
    } catch (error) {
      devError("Error signing out:", error);
    }
  };

  const handleStatusChange = async (newStatus: UserStatus) => {
    const result = await updateUserStatus(user, newStatus);
    if (!result.success) {
      devError("Failed to update user status:", result.error);
      toast.error("Failed to update your status");
    }
  };

  // show back button if not on the root dashboard page
  const shouldShowBackButton = pathname !== "/dashboard";

  return (
    <header className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {shouldShowBackButton && (
              <Link href={backButtonUrl}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 dark:hover:bg-neutral-700"
                >
                  <ArrowLeft size={24} />
                  <span className="hidden sm:block">{backButtonText}</span>
                </Button>
              </Link>
            )}
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 hidden sm:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:opacity-80">
                {userDocument ? (
                  <div className="relative">
                    <div className="absolute -top-[4px] -right-[4px] p-[2px] rounded-full bg-neutral-50 dark:bg-neutral-800">
                      <UserStatusIcon
                        status={userDocument.status}
                        tooltipSide="left"
                      />
                    </div>
                    <UserIcon user={userDocument} />
                  </div>
                ) : (
                  <Settings
                    className="text-neutral-700 dark:text-neutral-300"
                    size={24}
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="-m-1">
                  <div className="text-sm p-4 dark:bg-neutral-800/50 ">
                    <div className="font-medium">
                      {getUserDisplayName(userDocument, user)}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {getUserEmail(userDocument, user)}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/settings" className="cursor-pointer">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleStatusChange("online")}
                      >
                        <div>Online</div>
                        <UserStatusIcon status="online" tooltipSide="left" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleStatusChange("brb")}
                      >
                        <div>Brb</div>
                        <UserStatusIcon status="brb" tooltipSide="left" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleStatusChange("offline")}
                      >
                        <div>Offline</div>{" "}
                        <UserStatusIcon status="offline" tooltipSide="left" />
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={handleLogout}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
