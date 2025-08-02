"use client";

import { useState, useEffect, useRef } from "react";

import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import ChatInput from "@/components/chatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { ImageGenerationMessage } from "@/types";

import GeneratedImageCard from "./generated-image-card";

// Configurable timeout for image generation requests (in milliseconds)
const IMAGE_GENERATION_TIMEOUT = 20000; // 20 seconds

export default function ImageGenerationPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ImageGenerationMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");

  // Track timeout state to prevent showing results after timeout
  const timeoutTrackingRef = useRef<Map<string, boolean>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    // Add a small delay to ensure images have rendered
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  }, [messages]);

  // Handle Enter keydown for textarea to generate image
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Handle form submit for textarea to generate image
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputPrompt.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    const prompt = inputPrompt.trim();

    // Add loading image message
    const loadingMessage: ImageGenerationMessage = {
      id: `loading-${Date.now()}`,
      content: prompt,
      timestamp: new Date(),
      loading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    // Create AbortController for this request
    const abortController = new AbortController();
    const requestId = loadingMessage.id;
    const newImageId = `image-${Date.now()}`;

    try {
      // Get auth token
      const token = await user.getIdToken();

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          timeoutTrackingRef.current.set(requestId, true);
          abortController.abort(
            "Request timed out. Aborting to free up resources for another request."
          );
          reject(
            new Error(
              "Request timed out. The server is taking too long to respond."
            )
          );
        }, IMAGE_GENERATION_TIMEOUT);
      });

      // Race between fetch and timeout
      const fetchPromise = fetch("/api/image-generation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: abortController.signal,
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      // Check if request was already timed out
      if (timeoutTrackingRef.current.get(requestId)) {
        return; // Don't process response if timeout already occurred
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Replace loading message with generated image
      const imageMessage: ImageGenerationMessage = {
        id: newImageId,
        content: prompt,
        imageUrl: data.image.b64_json
          ? `data:image/png;base64,${data.image.b64_json}`
          : undefined,
        timestamp: new Date(),
        loading: false,
      };

      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(
          (msg) => msg.id === loadingMessage.id
        );
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = imageMessage;
        }
        return newMessages;
      });
      setInputPrompt("");
    } catch (error) {
      devError("Error generating image:", error);

      // Replace loading message with error message
      const errorMessage: ImageGenerationMessage = {
        id: `error-${Date.now()}`,
        content:
          error instanceof Error ? error.message : "Failed to generate image",
        timestamp: new Date(),
      };

      setMessages((prev) => {
        return prev.map((message) =>
          message.id === newImageId ? errorMessage : message
        );
      });

      toast.error("Failed to generate image");
    } finally {
      // Clean up timeout tracking
      timeoutTrackingRef.current.delete(requestId);

      setIsGenerating(false);
      // Focus back on textarea after a small delay to ensure React has re-rendered
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 flex flex-col flex-1 overflow-hidden h-[calc(100dvh-64px)]">
      {messages.length === 0 ? (
        <div className="text-center pb-8 pt-16 flex flex-1 items-center justify-center mb-32">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <ImageIcon size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                AI Image Generator
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                Describe the image you want to create and we&apos;ll generate it
                for you!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="w-full h-[calc(100dvh-65px)] px-2 sm:px-0">
          {messages.map((message) => (
            <div
              className="w-full h-full mt-4 flex items-center justify-center mb-4"
              key={message.id}
            >
              <GeneratedImageCard key={message.id} message={message} />
            </div>
          ))}
          <div ref={messagesEndRef} className="mb-30 h-8 sm:h-4" />
        </ScrollArea>
      )}
      <div className="w-full px-4 absolute bottom-0 left-0 right-0">
        <div className="max-w-3xl sm:mx-auto bg-neutral-50 dark:bg-neutral-800 rounded-t-[28px] pb-4 w-full">
          <ChatInput
            handleFormSubmit={handleSubmit}
            inputMessage={inputPrompt}
            setInputMessage={setInputPrompt}
            handleKeyDown={handleKeyDown}
            isSubmitting={isGenerating}
            ref={textareaRef}
            placeholder="Generate an image of..."
            maxLength={1000}
          />
        </div>
      </div>
    </div>
  );
}
