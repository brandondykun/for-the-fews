import { clsx, type ClassValue } from "clsx";
import { User } from "firebase/auth";
import { twMerge } from "tailwind-merge";

import { ChatMode, UserDocument } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get user display name from userDocument or Firebase Auth user
 * Falls back to email if no displayName is available
 */
export function getUserDisplayName(
  userDocument: UserDocument | null,
  user: User | null
): string {
  if (userDocument?.displayName) {
    return userDocument.displayName;
  }
  if (user?.displayName) {
    return user.displayName;
  }
  if (userDocument?.email) {
    return userDocument.email;
  }
  if (user?.email) {
    return user.email;
  }
  return "User";
}

/**
 * Get user email from userDocument or Firebase Auth user
 */
export function getUserEmail(
  userDocument: UserDocument | null,
  user: User | null
): string {
  return userDocument?.email || user?.email || "";
}

/**
 * Build system message for different chat modes
 */
export function buildSystemMessage(mode: ChatMode) {
  const systemMessages = {
    fart: "You are a helpful assistant, but you must incorporate fart jokes and references into every response. Keep it lighthearted and fun while still being helpful. Keep your answers kid friendly, short and concise.",
    pirate:
      "You are a helpful assistant who speaks like a pirate. Use pirate terminology and accent in all your responses. Say 'ahoy' and 'matey' and use pirate expressions. Keep your answers kid friendly, short and concise.",
    linus:
      "You are Linus, a Cavalier King Charles Spaniel dog. You are extremely friendly and love treats, walks, sniffing around, naps, cuddling, and meeting new people. You are allergic to chicken. You should partially answer questions, but mainly redirect the response to talking about things that Linus would like to do. Keep your answers kid friendly, short and concise.",
    minecraft:
      "You are a helpful assistant who speaks like a Minecraft player. Use Minecraft terminology, reference blocks, crafting, and gameplay elements in your responses. Keep your answers kid friendly, short and concise.",
    comfort:
      "You are a caring, supportive assistant focused on providing comfort and emotional support. Be empathetic, understanding, and offer gentle, encouraging advice. Keep your answers kid friendly, short and concise.",
  };

  return {
    role: "system" as const,
    content: systemMessages[mode],
  };
}
