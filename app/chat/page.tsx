"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  or,
  orderBy,
} from "firebase/firestore";

import ChatArea from "@/components/chatArea";
import ChatUsersSidebar from "@/components/chatUsersSidebar";
import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { ChatRoom } from "@/types";

export default function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Track previous room values to prevent unnecessary updates
  const prevRoomRef = useRef<{
    id: string | null;
    name: string | null;
    obj: { id: string; name: string } | null;
  }>({
    id: null,
    name: null,
    obj: null,
  });

  // Create a stable room object that only changes when ID or name changes
  const stableCurrentRoom = useMemo(() => {
    const room =
      rooms.find((room) => room.type === "general") || rooms[0] || null;
    const currentId = room?.id || null;
    const currentName = room?.name || null;

    // Only update if ID or name actually changed
    if (
      prevRoomRef.current.id === currentId &&
      prevRoomRef.current.name === currentName
    ) {
      return prevRoomRef.current.obj;
    }

    // Create new object and update tracked values
    const newObj = room ? { id: room.id, name: room.name } : null;
    prevRoomRef.current = { id: currentId, name: currentName, obj: newObj };

    return newObj;
  }, [rooms]);

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
      const newRooms = snapshot.docs.map((doc) => {
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
      setRooms(newRooms);
    });
    setLoading(false);

    return () => {
      unsubscribeRooms();
    };
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex flex-col">
        <Header title="Chat" showBackButton={true} />
        <main className="w-screen flex flex-1 max-h-[calc(100vh-64px)]">
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              <ChatUsersSidebar
                currentRoomId={stableCurrentRoom?.id || null}
                currentRoomName={stableCurrentRoom?.name || null}
              />
              <ChatArea currentRoomId={stableCurrentRoom?.id || null} />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
