import React from "react";

import { X, ArrowUp } from "lucide-react";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface Props {
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      handleFormSubmit,
      inputMessage,
      setInputMessage,
      handleKeyDown,
      isSubmitting,
      placeholder,
      maxLength,
      disabled,
    },
    ref
  ) => {
    const handleClear = () => {
      setInputMessage("");
      if (ref && "current" in ref) {
        ref.current?.focus();
      }
    };

    return (
      <div className="max-w-3xl mx-auto flex w-full">
        <form
          onSubmit={handleFormSubmit}
          className="space-y-2 flex flex-col flex-1"
        >
          <div className="bg-neutral-200/70 border-neutral-200/90 dark:bg-neutral-700/70 rounded-[28px] border dark:border-neutral-700/80 p-3">
            <Textarea
              ref={ref}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="max-h-[250px] min-h-[48px] p-2 resize-none dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder-neutral-400 focus-visible:ring-[0px] border-none focus-visible:border-none md:text-base bg-transparent dark:bg-transparent shadow-none"
              disabled={isSubmitting || disabled}
              maxLength={maxLength}
            />
            <div className="flex justify-between items-center pt-1">
              <Button
                type="button"
                onClick={handleClear}
                disabled={!inputMessage.trim() || isSubmitting}
                className="h-9 w-9 px-3 rounded-full bg-transparent border border-neutral-400 dark:border-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 disabled:opacity-60"
              >
                <X size={16} />
              </Button>
              {maxLength ? (
                <div
                  className={`text-xs mt-4 ${
                    inputMessage.length >= maxLength
                      ? "text-red-500"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {inputMessage.length}/{maxLength}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSubmitting}
                className="h-9 w-9 rounded-full bg-neutral-800 dark:bg-neutral-200 dark:hover:bg-neutral-50 hover:bg-neutral-900 text-neutral-100 dark:text-neutral-900 disabled:opacity-60"
              >
                <ArrowUp size={24} strokeWidth={3} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
