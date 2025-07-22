"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

import { devError, devWarn } from "@/lib/dev-utils";
import { updateUserStatus } from "@/lib/user-status";

import { auth, db } from "../lib/firebase";
import { UserDocument } from "../types";

interface AuthContextType {
  user: User | null;
  userDocument: UserDocument | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDocument: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userDocUnsubscribe: Unsubscribe | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);

      // Clean up previous user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }

      if (user) {
        // auto update user status to online when logging in
        await updateUserStatus(user, "online");

        // Set up real-time listener for user document
        const userDocRef = doc(db, "users", user.uid);
        userDocUnsubscribe = onSnapshot(
          userDocRef,
          (userDocSnap) => {
            if (userDocSnap.exists()) {
              setUserDocument(userDocSnap.data() as UserDocument);
            } else {
              devWarn(`User document not found for user: ${user.uid}`);
              setUserDocument(null);
            }
            setLoading(false);
          },
          (error) => {
            devError("Error listening to user document:", error);
            setUserDocument(null);
            setLoading(false);
          }
        );
      } else {
        // Clear user document when user logs out
        setUserDocument(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDocument, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
