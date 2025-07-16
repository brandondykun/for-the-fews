import React from "react";

import { Send } from "lucide-react";

import { MAX_MESSAGE_CHARACTERS } from "@/constants";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface Props {
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      handleFormSubmit,
      inputMessage,
      setInputMessage,
      handleKeyDown,
      isSubmitting,
    },
    ref
  ) => {
    return (
      <div className="px-4 border-neutral-200 dark:border-neutral-700">
        <form onSubmit={handleFormSubmit} className="space-y-2">
          <div className="flex space-x-2 items-center">
            <Textarea
              ref={ref}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 rounded-2xl focus-visible:ring-[0px] border-neutral-200 focus-visible:border-neutral-200 md:text-base px-3 py-3 shadow-neutral-300/40 shadow-md dark:shadow-neutral-900/40"
              disabled={isSubmitting}
              maxLength={MAX_MESSAGE_CHARACTERS}
              rows={1}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSubmitting}
              className="h-10 px-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white disabled:bg-neutral-300 dark:disabled:bg-neutral-600"
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="flex justify-between items-center mb-2">
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
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
