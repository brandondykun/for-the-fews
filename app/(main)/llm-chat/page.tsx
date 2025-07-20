"use client";

import React from "react";

import { RefreshCw } from "lucide-react";

import ChatModeButtons from "@/components/chatModeButtons";
import LlmChatInput from "@/components/llmChatInput";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit(e);
    }
  };

  const handleChatModeChange = (mode: ChatMode) => {
    changeChatMode(mode);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <main className="flex flex-1 flex-col md:flex-row bg-neutral-50 dark:bg-neutral-800 h-[calc(100dvh-64px)]">
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
      <div className="hidden md:block border-b border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-900 min-w-64 h-[calc(100dvh-64px)]">
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
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100dvh-100px)] md:h-[calc(100dvh-64px)] relative">
        <ScrollArea className="h-full overflow-y-scroll px-2">
          <div className="space-y-12 pt-4 flex-1 max-w-3xl mx-auto px-2 relative h-[calc(100dvh-100px)] md:h-[calc(100dvh-64px)]">
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
                    {streaming && !message.isUser && message.text === "" && (
                      <span className="inline-block animate-pulse">●●●</span>
                    )}
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="mb-48 h-36" />
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 px-4">
          <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-800 rounded-t-[28px] pb-2">
            <LlmChatInput
              handleSubmit={handleSubmit}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleKeyDown={handleKeyDown}
              isSubmitting={loading}
              ref={textareaRef}
              isLimitReached={isLimitReached}
              remaining={remaining}
              maxLength={MAX_MESSAGE_CHARACTERS}
              placeholder="Ask anything"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
