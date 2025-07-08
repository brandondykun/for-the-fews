"use client";

import Link from "next/link";

import { Clock } from "lucide-react";

import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GradientBorder from "@/components/ui/gradientBorder";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Header title="Chat" showBackButton={true} variant="backdrop-blur" />

        <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
                Coming Soon
              </h1>
              <p className="text-2xl text-neutral-600 dark:text-neutral-400 animate-pulse">
                Something amazing is brewing!
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                We&apos;re working hard to bring you an incredible chat
                experience. Stay tuned!
              </p>
            </div>
            <div className="flex flex-1 justify-center items-center">
              <GradientBorder
                width={1}
                roundedSize="xl"
                rotate
                rotationSpeed="slow"
              >
                <Card className="max-w-md bg-white dark:bg-neutral-800 backdrop-blur-sm border-neutral-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock size={20} />
                      In the meantime...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Check out the themed AI Chat for hilariously intelligent
                      AI conversations!
                    </p>
                    <Link href="/llm-chat">
                      <Button variant="action" className="w-full">
                        Try AI Chat
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </GradientBorder>
            </div>

            <div className="pt-8">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
