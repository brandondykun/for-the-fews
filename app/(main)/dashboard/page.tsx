"use client";

import Link from "next/link";

import {
  BotMessageSquare,
  Gamepad2,
  CircleUserRound,
  Settings,
  MessageCircle,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GradientBorder from "@/components/ui/gradientBorder";
import { useAuth } from "@/context/auth-context";
import { getUserDisplayName } from "@/lib/utils";

export default function DashboardPage() {
  const { user, userDocument } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 min-h-[calc(100dvh-64px)]">
      {/* User Profile Summary */}
      <div className="mb-8">
        <Card className="dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center">
              <User size={20} />
              Welcome back, {getUserDisplayName(userDocument, user)}!
            </CardTitle>
            <CardDescription className="dark:text-neutral-300">
              {userDocument ? (
                <div className="space-y-1">
                  <div>
                    One of the Few since:{" "}
                    {new Date(userDocument.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div>Loading profile...</div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GradientBorder width={1} roundedSize="xl">
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center text-xl">
                <BotMessageSquare size={22} />
                AI Chat
              </CardTitle>
              <CardDescription className="dark:text-neutral-300">
                Interact with different themed AI assistants for hilariously
                helpful conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/llm-chat">
                <Button variant="action" className="w-full">
                  Open AI Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </GradientBorder>

        <Card className="dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center text-xl">
              <MessageCircle size={22} />
              Chat
            </CardTitle>
            <CardDescription className="dark:text-neutral-300">
              Connect with other selected Few users in real-time conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chat">
              <Button variant="outline" className="w-full">
                Open Chat
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center text-xl">
              <Gamepad2 size={22} />
              Games
            </CardTitle>
            <CardDescription className="dark:text-neutral-300">
              Play fun games by yourself or with your fellow Few members (in the
              works)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center text-xl">
              <CircleUserRound size={22} />
              Profile
            </CardTitle>
            <CardDescription className="dark:text-neutral-300">
              View and manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-neutral-800 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="dark:text-neutral-100 flex flex-row gap-2 items-center text-xl">
              <Settings size={22} />
              Settings
            </CardTitle>
            <CardDescription className="dark:text-neutral-300">
              Configure your preferences and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
