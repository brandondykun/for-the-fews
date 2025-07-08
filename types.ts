export type ChatMode = "fart" | "pirate" | "linus" | "minecraft" | "comfort";

// User document types
export interface UserDocument {
  email: string;
  displayName: string;
  createdAt: string; // ISO string
  joinCode: string; // The join code used for registration
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
