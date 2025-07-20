import React from "react";

import ChatInput from "./chatInput";

interface Props {
  handleSubmit: (e: React.FormEvent) => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  isLimitReached: boolean;
  remaining: number;
  maxLength?: number;
  placeholder?: string;
}

const LlmChatInput = React.forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      handleSubmit,
      inputMessage,
      setInputMessage,
      handleKeyDown,
      isSubmitting,
      isLimitReached,
      remaining,
      maxLength,
      placeholder,
    },
    ref
  ) => {
    return (
      <>
        <ChatInput
          handleFormSubmit={handleSubmit}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleKeyDown={handleKeyDown}
          isSubmitting={isSubmitting}
          ref={ref}
          placeholder={
            isLimitReached
              ? "Daily message limit reached. Try again tomorrow!"
              : placeholder
                ? placeholder
                : "Type your message..."
          }
          maxLength={maxLength}
          disabled={isLimitReached}
        />
        <div className="max-w-3xl mx-auto flex w-full px-2 mt-2 pl-4 justify-center">
          {isLimitReached && (
            <span className="text-xs text-red-600 dark:text-red-500">
              Daily limit reached
            </span>
          )}
          {!isLimitReached && remaining <= 10 && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              {remaining} messages left today
            </span>
          )}
        </div>
      </>
    );
  }
);

LlmChatInput.displayName = "LlmChatInput";

export default LlmChatInput;
