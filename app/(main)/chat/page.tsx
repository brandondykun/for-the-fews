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
    <div className="bg-neutral-100 dark:bg-neutral-800 flex flex-col h-[calc(100dvh-64px)]">
      <div className="w-screen flex flex-1 h-full">
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
      </div>
    </div>
  );
}
