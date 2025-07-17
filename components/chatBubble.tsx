import React from "react";

import { Timestamp } from "firebase/firestore";

import { useAuth } from "@/context/auth-context";
import { ChatMessage } from "@/types";

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const { user } = useAuth();
  const isCurrentUser = message.authorId === user?.uid;

  const createdAt = new Timestamp(
    message.createdAt.seconds,
    message.createdAt.nanoseconds
  );
  const createdAtTime = createdAt.toDate().toLocaleTimeString();
  const createdAtDate = createdAt.toDate().getDate();

  const isToday = createdAtDate === new Date().getDate();

  const createdAtDateString = isToday
    ? createdAtTime
    : `${createdAt.toDate().toLocaleDateString()} - ${createdAtTime}`;

  return (
    <div
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      {!isCurrentUser && (
        <div
          className={`pl-2 text-sm font-semibold text-neutral-700 dark:text-neutral-400 ${isCurrentUser ? "text-right" : ""}`}
        >
          {message.authorName}
        </div>
      )}
      <div
        className={`py-1.5 px-4 rounded-xl max-w-[200px] xs:max-w-[280px] sm:max-w-sm lg:max-w-md xl:max-w-lg text-neutral-900 dark:text-neutral-100 break-words ${
          isCurrentUser
            ? "bg-sky-300 dark:bg-sky-700"
            : "bg-neutral-200 dark:bg-neutral-600"
        }`}
      >
        {message.text}
      </div>
      <div
        className={`text-[11px] text-neutral-500 dark:text-neutral-500 pt-1 ${isCurrentUser ? "text-right pr-2" : "pl-2"}`}
      >
        {createdAtDateString}
      </div>
    </div>
  );
};

export default ChatBubble;
