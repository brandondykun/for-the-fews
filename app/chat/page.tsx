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
  or,
  orderBy,
} from "firebase/firestore";
import { Send } from "lucide-react";
import { toast } from "sonner";

import ChatBubble from "@/components/chatBubble";
import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_CHARACTERS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { ChatMessage, ChatRoom } from "@/types";

export default function ChatPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const outgoingMessageSound = useRef<HTMLAudioElement>(null);
  const incomingMessageSound = useRef<HTMLAudioElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Listen to rooms in real-time
    const roomsQuery = query(
      collection(db, "rooms"),
      or(
        where("members", "array-contains", user.uid),
        where("type", "==", "general")
      ),
      orderBy("createdAt", "desc")
    );
    const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => {
        const data = doc.data({ serverTimestamps: "estimate" });
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          members: data.members,
          createdAt: data.createdAt,
          description: data.description,
          lastMessage: data.lastMessage,
        };
      });
      // set to default 'general' room for now
      setCurrentRoom(rooms[0]);
    });

    // Listen to messages in real-time
    const messagesQuery = query(
      collection(db, "messages"),
      where("roomId", "==", "general"),
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
        if (newMessage.authorId !== user.uid) {
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
      unsubscribeRooms();
      unsubscribe();
    };
  }, [user, setLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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

  const handleSubmit = async () => {
    if (!inputMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage("general", inputMessage);
      setInputMessage("");

      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Error sending message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex flex-col">
          <Header title="Chat" showBackButton={true} variant="backdrop-blur" />
          <div className="flex-1 flex items-center justify-center">
            <LoadingScreen size="md" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex flex-col">
        <Header title="Chat" showBackButton={true} variant="backdrop-blur" />
        <audio
          ref={outgoingMessageSound}
          src="/sounds/notification-sound-1.wav"
        />
        <audio
          ref={incomingMessageSound}
          src="/sounds/notification-sound-2.wav"
        />

        <main className="w-full flex flex-1 max-h-[calc(100vh-64px)]">
          <div className="flex-1 flex flex-col">
            {currentRoom && (
              <div className="p-1 bg-neutral-100 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-900">
                <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 text-center">
                  {currentRoom.name} Chat
                </h2>
              </div>
            )}
            <div className="flex flex-col overflow-hidden w-full xl:w-[1000px] lg:mx-auto flex-1">
              <ScrollArea
                className="flex-1 px-4 md:px-8 overflow-y-scroll"
                ref={scrollAreaRef}
              >
                <div className="space-y-3 py-4">
                  {messages.length === 0 ? (
                    <div className="text-center pb-8 pt-16">
                      <p className="text-neutral-500 dark:text-neutral-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatBubble key={message.id} message={message} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="px-4 border-neutral-200 dark:border-neutral-700">
                <form onSubmit={handleFormSubmit} className="space-y-2">
                  <div className="flex space-x-2 items-center">
                    <Textarea
                      ref={textareaRef}
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
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
