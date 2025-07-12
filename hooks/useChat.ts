import { useState, useEffect, useRef } from "react";

import { DEFAULT_FIRST_MESSAGES, MAX_CONVERSATION_HISTORY } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { useRateLimit } from "@/hooks/useRateLimit";
import { devError, devWarn } from "@/lib/dev-utils";
import { ChatMode, Message } from "@/types";

export function useChat() {
  const [messagesByMode, setMessagesByMode] = useState<
    Record<ChatMode, Message[]>
  >(DEFAULT_FIRST_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("fart");

  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { remaining, isLimitReached, updateCount, resetIfNeeded } =
    useRateLimit();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesByMode, chatMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Auto-focus textarea when not rate limited
  useEffect(() => {
    if (textareaRef.current && !isLimitReached) {
      textareaRef.current.focus();
    }
  }, [isLimitReached]);

  // Reset rate limit if needed
  useEffect(() => {
    resetIfNeeded();
  }, [resetIfNeeded]);

  const currentMessages = messagesByMode[chatMode];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (isLimitReached) {
      devWarn("Rate limit exceeded, cannot send message");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessagesByMode((prev) => ({
      ...prev,
      [chatMode]: [...prev[chatMode], userMessage],
    }));

    const currentInput = inputMessage;
    setInputMessage("");
    setLoading(true);
    setStreaming(true);

    // Create placeholder AI message
    const aiMessageId = (Date.now() + 1).toString();
    const placeholderAiMessage: Message = {
      id: aiMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessagesByMode((prev) => ({
      ...prev,
      [chatMode]: [...prev[chatMode], placeholderAiMessage],
    }));

    try {
      await processAIResponse(currentInput, aiMessageId);
    } catch (error) {
      handleChatError(error, aiMessageId);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const processAIResponse = async (input: string, messageId: string) => {
    // Build conversation history
    const conversationMessages = [
      ...currentMessages
        .filter((msg) => msg.id !== "1")
        .slice(-MAX_CONVERSATION_HISTORY)
        .map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
      { role: "user", content: input },
    ];

    const idToken = await user?.getIdToken();
    if (!idToken) {
      throw new Error("Unable to get authentication token");
    }

    const response = await fetch("/api/llm-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        messages: conversationMessages,
        chatMode: chatMode,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        updateCount(errorData.remaining || 0);
        throw new Error(errorData.error || "Rate limit exceeded");
      }
      throw new Error("Failed to get response from AI");
    }

    // Update rate limit from headers
    const remainingFromHeader = response.headers.get("X-RateLimit-Remaining");
    if (remainingFromHeader) {
      updateCount(parseInt(remainingFromHeader, 10));
    }

    // Handle streaming response
    await handleStreamingResponse(response, messageId);
  };

  const handleStreamingResponse = async (
    response: Response,
    messageId: string
  ) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) return;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.content) {
              accumulatedText += data.content;
              setMessagesByMode((prev) => ({
                ...prev,
                [chatMode]: prev[chatMode].map((msg) =>
                  msg.id === messageId ? { ...msg, text: accumulatedText } : msg
                ),
              }));
            } else if (data.done) {
              break;
            }
          } catch (parseError) {
            devError("Error parsing chunk:", parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleChatError = (error: unknown, messageId: string) => {
    devError("Error calling AI:", error);

    let errorMessage =
      "Sorry, I'm having trouble connecting to the AI service. Please try again.";
    if (error instanceof Error) {
      if (
        error.message.includes("Rate limit") ||
        error.message.includes("limit exceeded")
      ) {
        errorMessage = error.message;
      }
    }

    // Update the AI message with error
    setMessagesByMode((prev) => ({
      ...prev,
      [chatMode]: prev[chatMode].map((msg) =>
        msg.id === messageId ? { ...msg, text: errorMessage } : msg
      ),
    }));
  };

  const changeChatMode = (mode: ChatMode) => {
    setChatMode(mode);
  };

  return {
    // State
    messagesByMode,
    inputMessage,
    loading,
    streaming,
    chatMode,
    currentMessages,
    remaining,
    isLimitReached,

    // Refs
    messagesEndRef,
    textareaRef,

    // Actions
    setInputMessage,
    sendMessage,
    changeChatMode,

    // Utilities
    scrollToBottom,
  };
}
