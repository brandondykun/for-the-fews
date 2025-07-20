"use client";

import { useRef, useState, useEffect } from "react";

import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { toast } from "sonner";

import ChatBubble from "@/components/chatBubble";
import ChatInput from "@/components/chatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAX_MESSAGE_CHARACTERS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { db } from "@/lib/firebase";
import { ChatMessage } from "@/types";

import { LoadingScreen } from "./ui/loading-spinner";

interface Props {
  currentRoomId: string | null;
}

export default function ChatArea({ currentRoomId }: Props) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const outgoingMessageSound = useRef<HTMLAudioElement>(null);
  const incomingMessageSound = useRef<HTMLAudioElement>(null);
  // Track if initial scroll is complete. this is used to determine if the scroll should be instant or smooth
  const initialScrollComplete = useRef(false);

  // Auto-scroll when messages change
  useEffect(() => {
    // Instant scroll on first load, smooth scroll on new messages
    messagesEndRef.current?.scrollIntoView({
      behavior: initialScrollComplete.current ? "smooth" : "instant",
    });
    if (messages && messages.length > 0) {
      initialScrollComplete.current = true;
    }
  }, [messages]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!user || !currentRoomId) return;
    setLoading(true);

    // Listen to messages in real-time
    const messagesQuery = query(
      collection(db, "messages"),
      where("roomId", "==", currentRoomId),
      limit(100), // Load last 100 messages
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot
        .docChanges()
        .filter((change) => change.type === "added");
      if (newMessages.length === 1) {
        // check for length 1 so it only plays when a new message is sent, not on initial page load
        const newMessage = newMessages[0].doc.data();
        if (newMessage.authorId !== user?.uid) {
          incomingMessageSound.current?.play().catch(console.log);
        }
      }
      const allMessages = snapshot.docs.map((doc) => {
        const data = doc.data({ serverTimestamps: "estimate" });
        return {
          id: doc.id,
          roomId: data.roomId,
          authorId: data.authorId,
          authorName: data.authorName,
          text: data.text,
          createdAt: data.createdAt,
        };
      });
      setMessages(allMessages.reverse());
    });
    setLoading(false);

    return () => {
      unsubscribe();
    };
  }, [user, setLoading, currentRoomId]);

  // Handle Enter keydown for textarea to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Send message to Firestore and update room's lastMessage as batch write
  const sendMessage = async (roomId: string, text: string) => {
    if (!user) return;

    const messageData = {
      roomId,
      authorId: user.uid,
      authorName: user.displayName,
      text,
      createdAt: serverTimestamp(),
    };

    // Use a batch write to update both collections atomically
    const batch = writeBatch(db);

    // Add the message
    const messageRef = doc(collection(db, "messages"));
    batch.set(messageRef, messageData);

    // Update the room's lastMessage
    const roomRef = doc(db, "rooms", roomId);
    batch.update(roomRef, {
      lastMessage: {
        text,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
      },
    });

    await batch.commit();
    outgoingMessageSound.current?.play();
  };

  // Handle form submit for textarea to send message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRoomId) return;

    if (!inputMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage(currentRoomId, inputMessage);
      setInputMessage("");

      // Focus back on textarea after a small delay to ensure React has re-rendered
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } catch (err) {
      devError("Error sending message:", err);
      toast.error("Error sending message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen while messages are loading
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-[calc(100dvh-64px)] relative">
      <audio
        ref={outgoingMessageSound}
        src="/sounds/notification-sound-1.wav"
      />
      <audio
        ref={incomingMessageSound}
        src="/sounds/notification-sound-2.wav"
      />
      {!messages || messages.length === 0 ? (
        <div className="text-center pb-8 pt-16 flex flex-1 items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {!messages
              ? "Loading messages..."
              : "No messages yet. Start the conversation!"}
          </p>
        </div>
      ) : (
        <ScrollArea
          className="flex flex-1 overflow-y-scroll px-2 h-[calc(100dvh-64px)]"
          ref={scrollAreaRef}
        >
          <div className="space-y-3 pt-4 flex-1 max-w-3xl mx-auto px-2 relative h-[calc(100dvh-64px)]">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} className="mb-48 h-42 sm:h-36" />
          </div>
        </ScrollArea>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-4">
        <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-800 rounded-t-[28px] pb-4">
          <ChatInput
            handleFormSubmit={handleSubmit}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleKeyDown={handleKeyDown}
            isSubmitting={isSubmitting}
            ref={textareaRef}
            placeholder="Type your message..."
            maxLength={MAX_MESSAGE_CHARACTERS}
          />
        </div>
      </div>
    </div>
  );
}
