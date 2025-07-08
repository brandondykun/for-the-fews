import { useState, useEffect, useCallback } from "react";

import { DAILY_MESSAGE_LIMIT } from "@/constants";
import { useAuth } from "@/context/auth-context";

const STORAGE_KEY = "rateLimit";

interface RateLimitState {
  usedCount: number;
  resetTime: Date;
  lastUpdated: Date;
}

interface UseRateLimitReturn {
  remaining: number;
  resetTime: Date;
  isLimitReached: boolean;
  updateCount: (newRemaining: number) => void;
  resetIfNeeded: () => void;
}

/**
 * Get the current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get the reset time for the current day (midnight local time)
 */
function getResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Load rate limit state from localStorage
 */
function loadRateLimitState(userId: string): RateLimitState {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Handle legacy format (when we stored 'remaining' instead of 'usedCount')
      if (parsed.remaining !== undefined && parsed.usedCount === undefined) {
        // Convert legacy format: usedCount = DAILY_MESSAGE_LIMIT - remaining
        const legacyRemaining = parsed.remaining;
        const legacyUsedCount = Math.max(
          0,
          DAILY_MESSAGE_LIMIT - legacyRemaining
        );
        return {
          usedCount: legacyUsedCount,
          resetTime: new Date(parsed.resetTime),
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }

      return {
        usedCount: parsed.usedCount || 0,
        resetTime: new Date(parsed.resetTime),
        lastUpdated: new Date(parsed.lastUpdated),
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to load rate limit state:", error);
    }
  }

  // Default state
  return {
    usedCount: 0,
    resetTime: getResetTime(),
    lastUpdated: new Date(),
  };
}

/**
 * Save rate limit state to localStorage
 */
function saveRateLimitState(userId: string, state: RateLimitState): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify({
        usedCount: state.usedCount,
        resetTime: state.resetTime.toISOString(),
        lastUpdated: state.lastUpdated.toISOString(),
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to save rate limit state:", error);
    }
  }
}

/**
 * Check if we need to reset the daily counter
 */
function shouldReset(lastUpdated: Date): boolean {
  const lastDate = lastUpdated.toISOString().split("T")[0];
  const currentDate = getCurrentDate();
  return lastDate !== currentDate;
}

/**
 * React hook for managing rate limit state
 */
export function useRateLimit(): UseRateLimitReturn {
  const { user } = useAuth();
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>(() => {
    if (typeof window !== "undefined" && user?.uid) {
      return loadRateLimitState(user.uid);
    }
    return {
      usedCount: 0,
      resetTime: getResetTime(),
      lastUpdated: new Date(),
    };
  });

  // Calculate remaining dynamically based on current limit
  const remaining = Math.max(0, DAILY_MESSAGE_LIMIT - rateLimitState.usedCount);
  const isLimitReached = remaining <= 0;

  // Reset counter if needed (new day)
  const resetIfNeeded = useCallback(() => {
    if (shouldReset(rateLimitState.lastUpdated)) {
      const newState: RateLimitState = {
        usedCount: 0,
        resetTime: getResetTime(),
        lastUpdated: new Date(),
      };
      setRateLimitState(newState);
      if (user?.uid) {
        saveRateLimitState(user.uid, newState);
      }
    }
  }, [rateLimitState.lastUpdated, user?.uid]);

  // Update the remaining count (convert from remaining to usedCount)
  const updateCount = useCallback(
    (newRemaining: number) => {
      const newUsedCount = Math.max(0, DAILY_MESSAGE_LIMIT - newRemaining);
      const newState: RateLimitState = {
        usedCount: newUsedCount,
        resetTime: getResetTime(),
        lastUpdated: new Date(),
      };
      setRateLimitState(newState);
      if (user?.uid) {
        saveRateLimitState(user.uid, newState);
      }
    },
    [user?.uid]
  );

  // Load state when user changes
  useEffect(() => {
    if (user?.uid) {
      const loadedState = loadRateLimitState(user.uid);

      // Check if we need to reset for new day
      if (shouldReset(loadedState.lastUpdated)) {
        const resetState: RateLimitState = {
          usedCount: 0,
          resetTime: getResetTime(),
          lastUpdated: new Date(),
        };
        setRateLimitState(resetState);
        saveRateLimitState(user.uid, resetState);
      } else {
        setRateLimitState(loadedState);
      }
    }
  }, [user?.uid]);

  // Sync with server once when user is available (separate effect)
  useEffect(() => {
    if (!user?.uid) return;

    // Inline sync logic to avoid circular dependency
    const syncWithServerInline = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/rate-limit-status", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const serverUsedCount = Math.max(
            0,
            DAILY_MESSAGE_LIMIT - data.remaining
          );

          const newState: RateLimitState = {
            usedCount: serverUsedCount,
            resetTime: new Date(data.resetTime),
            lastUpdated: new Date(),
          };

          setRateLimitState(newState);
          saveRateLimitState(user.uid, newState);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to sync with server:", error);
        }
        // Don't throw - gracefully degrade to client-side state
      }
    };

    syncWithServerInline();
  }, [user]); // Only depends on user?.uid

  // Auto-reset at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = rateLimitState.resetTime.getTime() - now.getTime();

    if (msUntilMidnight > 0) {
      const timeout = setTimeout(() => {
        resetIfNeeded();
      }, msUntilMidnight);

      return () => clearTimeout(timeout);
    }
  }, [rateLimitState.resetTime, resetIfNeeded]);

  return {
    remaining,
    resetTime: rateLimitState.resetTime,
    isLimitReached,
    updateCount,
    resetIfNeeded,
  };
}
