"use client";

import Link from "next/link";

import { signOut } from "firebase/auth";
import { ArrowLeft, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import ColorModeSwitch from "@/components/ui/colorModeSwitch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { auth } from "@/lib/firebase";
import { getUserDisplayName, getUserEmail } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  showSignOut?: boolean;
  variant?: "default" | "backdrop-blur";
}

export default function Header({
  title,
  showBackButton = false,
  backButtonUrl = "/dashboard",
  showSignOut = true,
  variant = "default",
}: HeaderProps) {
  const { user, userDocument } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      devError("Error signing out:", error);
    }
  };

  const headerClassName =
    variant === "backdrop-blur"
      ? "bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm border-b border-neutral-200 dark:border-neutral-700"
      : "bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700";

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
          <div className="flex items-center space-x-4 gap-6">
            <ColorModeSwitch />
            {showSignOut && (
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:opacity-80">
                  <Settings
                    className="text-neutral-700 dark:text-neutral-300"
                    size={24}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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
