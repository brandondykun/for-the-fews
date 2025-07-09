import { NextRequest } from "next/server";

import { DAILY_MESSAGE_LIMIT, REGISTRATION_ATTEMPTS_LIMIT } from "@/constants";
import {
  RateLimitResult,
  RateLimitDocument,
  RegistrationRateLimitResult,
  RegistrationRateLimitDocument,
} from "@/types";

import { devError } from "./dev-utils";
import { adminDb } from "./firebase-admin";

const COLLECTION_NAME = "rateLimits";
const REGISTRATION_COLLECTION_NAME = "registrationRateLimits";

/**
 * Get client IP address from Next.js request
 */
export function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (for different proxy setups)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default IP if none found (shouldn't happen in production)
  return "127.0.0.1";
}

/**
 * Get the current hour in YYYY-MM-DD-HH format
 */
function getCurrentHour(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Get the reset time for the next hour
 */
function getNextHourResetTime(): Date {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour;
}

/**
 * Generate document ID for registration rate limiting
 */
function getRegistrationRateLimitDocId(
  ipAddress: string,
  hour: string
): string {
  // Hash the IP for privacy while maintaining uniqueness
  const hashedIP = Buffer.from(ipAddress)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  return `${hashedIP}_${hour}`;
}

/**
 * Get the current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get the reset time for the current day (midnight UTC)
 */
function getResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Generate document ID for rate limiting
 */
function getRateLimitDocId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

/**
 * Check and update rate limit for a user
 * Returns whether the request is allowed and remaining count
 */
export async function checkAndUpdateRateLimit(
  userId: string
): Promise<RateLimitResult> {
  const currentDate = getCurrentDate();
  const docId = getRateLimitDocId(userId, currentDate);
  const docRef = adminDb.collection(COLLECTION_NAME).doc(docId);

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const now = new Date();

      if (!doc.exists) {
        // First request of the day
        const newDoc: RateLimitDocument = {
          userId,
          date: currentDate,
          count: 1,
          createdAt: now,
          updatedAt: now,
        };

        transaction.set(docRef, newDoc);

        return {
          allowed: true,
          remaining: DAILY_MESSAGE_LIMIT - 1,
          resetTime: getResetTime(),
        };
      }

      const data = doc.data() as RateLimitDocument;

      // Check if we've exceeded the limit
      if (data.count >= DAILY_MESSAGE_LIMIT) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: getResetTime(),
        };
      }

      // Update the count
      const newCount = data.count + 1;
      transaction.update(docRef, {
        count: newCount,
        updatedAt: now,
      });

      return {
        allowed: true,
        remaining: DAILY_MESSAGE_LIMIT - newCount,
        resetTime: getResetTime(),
      };
    });
  } catch (error) {
    // Always log rate limit errors, even in production, since they're critical
    console.error("Rate limit check failed:", error);

    // Fail open - allow the request if we can't check the limit
    // This prevents the rate limiter from breaking the entire service
    return {
      allowed: true,
      remaining: DAILY_MESSAGE_LIMIT,
      resetTime: getResetTime(),
    };
  }
}

/**
 * Get current rate limit status without updating the count
 */
export async function getRateLimitStatus(
  userId: string
): Promise<RateLimitResult> {
  const currentDate = getCurrentDate();
  const docId = getRateLimitDocId(userId, currentDate);
  const docRef = adminDb.collection(COLLECTION_NAME).doc(docId);

  try {
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        allowed: true,
        remaining: DAILY_MESSAGE_LIMIT,
        resetTime: getResetTime(),
      };
    }

    const data = doc.data() as RateLimitDocument;
    const remaining = Math.max(0, DAILY_MESSAGE_LIMIT - data.count);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime: getResetTime(),
    };
  } catch (error) {
    // Always log rate limit errors, even in production, since they're critical
    console.error("Rate limit status check failed:", error);

    // Fail open
    return {
      allowed: true,
      remaining: DAILY_MESSAGE_LIMIT,
      resetTime: getResetTime(),
    };
  }
}

/**
 * Check and update registration rate limit for an IP address
 * Returns whether the request is allowed and remaining count
 */
export async function checkAndUpdateRegistrationRateLimit(
  ipAddress: string
): Promise<RegistrationRateLimitResult> {
  const currentHour = getCurrentHour();
  const docId = getRegistrationRateLimitDocId(ipAddress, currentHour);
  const docRef = adminDb.collection(REGISTRATION_COLLECTION_NAME).doc(docId);

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const now = new Date();

      if (!doc.exists) {
        // First request of the hour
        const newDoc: RegistrationRateLimitDocument = {
          ipAddress,
          hour: currentHour,
          count: 1,
          createdAt: now,
          updatedAt: now,
        };

        transaction.set(docRef, newDoc);

        return {
          allowed: true,
          remaining: REGISTRATION_ATTEMPTS_LIMIT - 1,
          resetTime: getNextHourResetTime(),
        };
      }

      const data = doc.data() as RegistrationRateLimitDocument;

      // Check if we've exceeded the limit
      if (data.count >= REGISTRATION_ATTEMPTS_LIMIT) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: getNextHourResetTime(),
        };
      }

      // Update the count
      const newCount = data.count + 1;
      transaction.update(docRef, {
        count: newCount,
        updatedAt: now,
      });

      return {
        allowed: true,
        remaining: REGISTRATION_ATTEMPTS_LIMIT - newCount,
        resetTime: getNextHourResetTime(),
      };
    });
  } catch (error) {
    devError("Registration rate limit check failed:", error);

    // Fail open - allow the request if we can't check the limit
    // This prevents the rate limiter from breaking the registration service
    return {
      allowed: true,
      remaining: REGISTRATION_ATTEMPTS_LIMIT,
      resetTime: getNextHourResetTime(),
    };
  }
}

/**
 * Get current registration rate limit status without updating the count
 */
export async function getRegistrationRateLimitStatus(
  ipAddress: string
): Promise<RegistrationRateLimitResult> {
  const currentHour = getCurrentHour();
  const docId = getRegistrationRateLimitDocId(ipAddress, currentHour);
  const docRef = adminDb.collection(REGISTRATION_COLLECTION_NAME).doc(docId);

  try {
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        allowed: true,
        remaining: REGISTRATION_ATTEMPTS_LIMIT,
        resetTime: getNextHourResetTime(),
      };
    }

    const data = doc.data() as RegistrationRateLimitDocument;
    const remaining = Math.max(0, REGISTRATION_ATTEMPTS_LIMIT - data.count);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime: getNextHourResetTime(),
    };
  } catch (error) {
    devError("Registration rate limit status check failed:", error);

    // Fail open
    return {
      allowed: true,
      remaining: REGISTRATION_ATTEMPTS_LIMIT,
      resetTime: getNextHourResetTime(),
    };
  }
}
