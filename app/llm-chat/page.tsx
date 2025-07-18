"use client";

import React from "react";

import { RefreshCw } from "lucide-react";

import ChatModeButtons from "@/components/chatModeButtons";
import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { DAILY_MESSAGE_LIMIT, MAX_MESSAGE_CHARACTERS } from "@/constants";
import { useChat } from "@/hooks/useChat";
import { getChatModeLabel } from "@/lib/utils";
import { ChatMode } from "@/types";

export default function ChatPage() {
  const {
    inputMessage,
    loading,
    streaming,
    chatMode,
    currentMessages,
    remaining,
    isLimitReached,
    messagesEndRef,
    textareaRef,
    setInputMessage,
    sendMessage,
    changeChatMode,
  } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChatModeChange = (mode: ChatMode) => {
    changeChatMode(mode);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800 flex flex-col">
        <Header title="AI Chat" showBackButton={true} showSignOut={true} />
        <main className="flex flex-1 flex-col md:flex-row h-[calc(100vh-64px)]">
          <div className="md:hidden bg-neutral-200 dark:bg-neutral-900 flex flex-row justify-between items-center px-2 py-1">
            <Drawer>
              <DrawerTrigger>
                <span className="flex items-center gap-2">
                  <div className="text-lg">{getChatModeLabel(chatMode)}</div>
                  <RefreshCw size={16} />
                </span>
              </DrawerTrigger>
              <DrawerContent className="h-full flex flex-col">
                <DrawerHeader>
                  <DrawerTitle>Choose a chat mode</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="p-4 overflow-auto flex flex-col gap-2 mb-4">
                  <div className="flex flex-col gap-2">
                    <ChatModeButtons
                      chatMode={chatMode}
                      handleChatModeChange={handleChatModeChange}
                    />
                  </div>
                </ScrollArea>
                <DrawerFooter>
                  <DrawerClose>
                    <span>Close</span>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isLimitReached
                    ? "text-red-600 dark:text-red-400"
                    : remaining <= 10
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              >
                {remaining} left
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                / {DAILY_MESSAGE_LIMIT}
              </span>
            </div>
          </div>
          <div className="hidden md:block border-b border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-900 min-w-64 h-[calc(100vh-64px)]">
            <div className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-20">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Daily Messages Limit
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isLimitReached
                      ? "text-red-600 dark:text-red-400"
                      : remaining <= 10
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {remaining} left
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  / {DAILY_MESSAGE_LIMIT}
                </span>
              </div>
              {isLimitReached && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Limit reached! Resets at midnight.
                </p>
              )}
            </div>
            <ScrollArea className="h-[calc(100vh-134px)] overflow-y-hidden flex flex-col flex-1 ">
              <div className="px-4 pt-4">
                <h3 className="text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                  Chat Mode:
                </h3>
                <p className="max-w-[200px] text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Pick a chat mode to set the tone for the conversation.
                </p>
                <div className="overflow-hidden flex flex-col flex-1 gap-2 mb-4">
                  <ChatModeButtons
                    chatMode={chatMode}
                    handleChatModeChange={handleChatModeChange}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="max-w-[200px] text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Note: Your chats are not currently saved. If you refresh the
                    page, your chats will be lost.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 max-w-4xl mx-auto pb-6 px-2 sm:px-6 lg:px-8 flex flex-col overflow-hidden h-[calc(100vh-100px)] md:h-[calc(100vh-64px)]">
            <ScrollArea className="flex-1 overflow-y-scroll sm:px-4">
              <div className="space-y-12 pt-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-2 sm:px-4 py-2 rounded-xl ${
                        message.isUser
                          ? "bg-neutral-200/50 dark:bg-neutral-700 dark:text-neutral-100 sm:max-w-sm mx-2 sm:mx-0 max-w-[90%]"
                          : "dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 max-w-4xl"
                      }`}
                    >
                      <p className="text-md">
                        {message.text}
                        {/* Show typing indicator for streaming messages */}
                        {streaming &&
                          !message.isUser &&
                          message.text === "" && (
                            <span className="inline-block animate-pulse">
                              ●●●
                            </span>
                          )}
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="px-4">
              <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isLimitReached
                      ? "Daily message limit reached. Try again tomorrow!"
                      : "Type your message..."
                  }
                  className={`flex-1 min-h-[40px] max-h-[120px] resize-none dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 rounded-2xl focus-visible:ring-[0px] border-neutral-200 focus-visible:border-neutral-200 md:text-base px-3 py-3 shadow-neutral-300/40 shadow-md dark:shadow-neutral-900/40 ${
                    isLimitReached ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading || isLimitReached}
                  maxLength={MAX_MESSAGE_CHARACTERS}
                  rows={1}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {isLimitReached && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        💬 Daily limit reached
                      </span>
                    )}
                    {!isLimitReached && remaining <= 10 && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        ⚠️ {remaining} messages left today
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      inputMessage.length >= MAX_MESSAGE_CHARACTERS
                        ? "text-red-500"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {inputMessage.length}/{MAX_MESSAGE_CHARACTERS}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
