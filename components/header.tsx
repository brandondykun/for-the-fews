"use client";

import Link from "next/link";

import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import ColorModeSwitch from "@/components/ui/colorModeSwitch";
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
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { auth, db } from "@/lib/firebase";
import { getUserDisplayName, getUserEmail } from "@/lib/utils";
import { UserStatus } from "@/types";

import UserIcon from "./ui/userIcon";
import UserStatusIcon from "./ui/userStatusIcon";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  showSignOut?: boolean;
}

export default function Header({
  title,
  showBackButton = false,
  backButtonUrl = "/dashboard",
  showSignOut = true,
}: HeaderProps) {
  const { user, userDocument } = useAuth();

  const handleLogout = async () => {
    try {
      // Set user status to offline before signing out
      await updateUserStatus("offline");
      await signOut(auth);
    } catch (error) {
      devError("Error signing out:", error);
    }
  };

  const updateUserStatus = async (newStatus: UserStatus) => {
    if (!user) {
      devError("No user available to update status");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        status: newStatus,
      });
    } catch (error) {
      devError("Error updating user status:", error);
    }
  };

  const headerClassName =
    "bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700";

  return (
    <header className={headerClassName}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backButtonUrl}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 dark:hover:bg-neutral-700"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4 gap-2">
            <ColorModeSwitch />
            {showSignOut && (
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
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
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
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => updateUserStatus("online")}
                        >
                          <div>Online</div>
                          <UserStatusIcon status="online" tooltipSide="left" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => updateUserStatus("brb")}
                        >
                          <div>Brb</div>
                          <UserStatusIcon status="brb" tooltipSide="left" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => updateUserStatus("away")}
                        >
                          <div>Away</div>
                          <UserStatusIcon status="away" tooltipSide="left" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => updateUserStatus("offline")}
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
