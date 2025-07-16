import { Timestamp } from "firebase/firestore";

export type ChatMode =
  | "fart"
  | "pirate"
  | "linus"
  | "minecraft"
  | "comfort"
  | "viking"
  | "ghost"
  | "classBully"
  | "bob"
  | "boomer"
  | "embarrassingParent";

export type UserStatus = "online" | "offline" | "away" | "brb";

// User document types
export interface UserDocument {
  email: string;
  displayName: string;
  createdAt: string; // ISO string
  joinCode: string; // The join code used for registration
  status: UserStatus;
}

// User document with Firestore document ID
export interface UserDocumentWithId extends UserDocument {
  id: string;
}

// Rate limiting types
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export interface RateLimitDocument {
  userId: string;
  date: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

// Registration rate limiting types
export interface RegistrationRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export interface RegistrationRateLimitDocument {
  ipAddress: string;
  hour: string; // Format: YYYY-MM-DD-HH
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp;
}

export type ChatRoomType = "general" | "private" | "group";
export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  members: string[];
  createdAt: string;
  description: string;
  lastMessage: {
    text: string;
    authorId: string;
    authorName: string;
    createdAt: Timestamp;
  };
}
