import { ChatMode, Message } from "./types";

// Rate limiting constants
export const DAILY_MESSAGE_LIMIT = 100;
export const MAX_MESSAGE_CHARACTERS = 250;
export const REGISTRATION_ATTEMPTS_LIMIT = 5; // Max attempts per hour per IP

// UI constants
export const SPINNER_SIZES = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

// Chat constants
export const MAX_CONVERSATION_HISTORY = 4; // Number of previous messages to include for context
export const MAX_CONTENT_LENGTH = 1000; // Max length for sanitized message content
export const DEFAULT_TEMPERATURE = 0.7;
export const MAX_TOKENS = 1000;

// Auth constants
export const MIN_PASSWORD_LENGTH = 6;

// Animation constants
export const GRADIENT_ROTATION_SPEEDS = {
  slow: "8s",
  normal: "4s",
  fast: "3s",
  fastest: "2s",
} as const;

export const DEFAULT_FIRST_MESSAGES: Record<ChatMode, Message[]> = {
  fart: [
    {
      id: "1",
      text: "Hello, I am your gassy AI assistant! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  pirate: [
    {
      id: "1",
      text: "Arrrrgg! I am your pirate AI assistant. What would ye like to discuss today?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  linus: [
    {
      id: "1",
      text: "Woof! Hi there! I'm Linus, your friendly dog AI assistant! *wags tail excitedly* What do you want to play or talk about today? Maybe we can discuss treats, walks, or belly rubs!",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  minecraft: [
    {
      id: "1",
      text: "Hey there, fellow crafter! 🧱 I'm your Minecraft expert assistant! Whether you want to talk about redstone contraptions, building epic structures, exploring the Nether, or anything Minecraft-related, I'm here to help! What's your latest Minecraft adventure?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  comfort: [
    {
      id: "1",
      text: "Hi there, friend 🤗 I'm here to listen and help brighten your day! It's okay to feel sad sometimes - you're not alone. Would you like to talk about what's bothering you, or shall we find something fun to cheer you up?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
};
