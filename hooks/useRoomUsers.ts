import { useState, useEffect, useCallback } from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { db } from "@/lib/firebase";
import { UserDocument, UserDocumentWithId } from "@/types";

export const useRoomUsers = (roomId: string) => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserDocumentWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setupUserListeners = useCallback(
    (memberIds: string[]) => {
      // For general room, we don't need memberIds
      if (roomId !== "general" && (!memberIds || memberIds.length === 0)) {
        setUsers([]);
        return () => {};
      }

      const userMap = new Map<string, UserDocumentWithId>();
      const unsubscribes: Unsubscribe[] = [];

      const updateUsersList = () => {
        setUsers(
          Array.from(userMap.values()).filter((user) => {
            return user.id !== authUser?.uid;
          })
        );
      };

      if (roomId === "general") {
        // For general room, listen to all users in real-time
        const usersCollectionRef = collection(db, "users");
        const unsubscribe = onSnapshot(
          usersCollectionRef,
          (snapshot) => {
            userMap.clear();
            snapshot.docs.forEach((doc) => {
              const userData = doc.data() as UserDocument;
              userMap.set(doc.id, {
                id: doc.id,
                ...userData,
              });
            });
            updateUsersList();
          },
          (err) => {
            devError("Error listening to users collection:", err);
            setError(err as Error);
          }
        );
        unsubscribes.push(unsubscribe);
      } else {
        // For other rooms, listen to specific user documents in real-time
        memberIds.forEach((userId) => {
          const userDocRef = doc(db, "users", userId);
          const unsubscribe = onSnapshot(
            userDocRef,
            (userDoc) => {
              if (userDoc.exists()) {
                const userData = userDoc.data() as UserDocument;
                userMap.set(userId, {
                  id: userId,
                  ...userData,
                });
              } else {
                userMap.delete(userId);
              }
              updateUsersList();
            },
            (err) => {
              devError(`Error listening to user ${userId}:`, err);
              setError(err as Error);
            }
          );
          unsubscribes.push(unsubscribe);
        });
      }

      // Return cleanup function
      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    },
    [roomId, authUser?.uid]
  );

  const refetch = useCallback(() => {
    if (roomId) {
      // setLoading(true);
      setError(null);

      getDoc(doc(db, "rooms", roomId))
        .then((roomDoc) => {
          if (roomDoc.exists()) {
            const memberIds = roomDoc.data().members || [];
            return setupUserListeners(memberIds);
          } else {
            setUsers([]);
            return () => {};
          }
        })
        .catch((err) => {
          devError("Error fetching room:", err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [roomId, setupUserListeners]);

  useEffect(() => {
    if (!roomId) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    let userListenersCleanup: (() => void) | null = null;

    // For general room, we don't need to listen to room changes
    // since we listen to all users anyway
    if (roomId === "general") {
      userListenersCleanup = setupUserListeners([]);
      setLoading(false);

      return () => {
        if (userListenersCleanup) {
          userListenersCleanup();
        }
      };
    }

    // For other rooms, listen to room changes to get updated member list
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribeRoom = onSnapshot(
      roomRef,
      async (roomDoc) => {
        try {
          // Clean up previous user listeners
          if (userListenersCleanup) {
            userListenersCleanup();
          }

          if (!roomDoc.exists()) {
            setUsers([]);
            setLoading(false);
            return;
          }

          const memberIds = roomDoc.data().members || [];
          userListenersCleanup = setupUserListeners(memberIds);
        } catch (err) {
          devError("Error in room snapshot:", err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        devError("Error listening to room changes:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeRoom();
      if (userListenersCleanup) {
        userListenersCleanup();
      }
    };
  }, [roomId, setupUserListeners]);

  return { users, loading, error, refetch };
};
