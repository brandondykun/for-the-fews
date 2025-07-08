"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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

/**
 * Fetch user document from Firestore
 */
async function fetchUserDocument(userId: string): Promise<UserDocument | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserDocument;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(`User document not found for user: ${userId}`);
      }
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user document:", error);
    }
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);

      if (user) {
        // Fetch user document from Firestore
        const userDoc = await fetchUserDocument(user.uid);
        setUserDocument(userDoc);
      } else {
        // Clear user document when user logs out
        setUserDocument(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDocument, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
