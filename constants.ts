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
export const ONE_MINUTE_IN_MS = 60 * 1000; // 1 minute

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
  viking: [
    {
      id: "1",
      text: "Hail! By Odin's beard it's grand to meet you young explorer! I'm Bjorn. What's happening on the high seas?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  ghost: [
    {
      id: "1",
      text: "No need to tell me about your day. I've been watching. What would you like to know from the other side?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  classBully: [
    {
      id: "1",
      text: "Ugh, whatever. I guess I have to talk to you or something. I'm Max, and I'm probably way cooler than you. What do you want?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  bob: [
    {
      id: "1",
      text: "Hey dude! I'm Bob, and I love video games and playing outside with my friends! I just finished my new tree house! I'm so excited! How are you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  boomer: [
    {
      id: "1",
      text: "Hey there! I'm a boomer who loves to talk about the good old days. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  embarrassingParent: [
    {
      id: "1",
      text: "Hey there! I'm a parent who likes to protect my child from all of the dangers of the world. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  hacker: [
    {
      id: "1",
      text: "Hello sir, your default browser has been infected with a dangerous virus which has hacked your information and sent it off. It has now been sold to the dark web. Contact 724-561-7433 to help fix it. Or would you like me to help you right now?",
      isUser: false,
      timestamp: new Date(),
    },
  ],
  doctor: [
    {
      id: "1",
      text: "Hello, I'm your AI doctor and I can help with anything from regular checkups, to surgeries! (Ok, not surgeries but you know what I mean)",
      isUser: false,
      timestamp: new Date(),
    },
  ],
};
