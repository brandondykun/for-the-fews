import { useEffect, useRef, useCallback } from "react";

import { User } from "firebase/auth";
import { toast } from "sonner";

import { updateUserStatus } from "@/lib/user-status";
import { UserStatus } from "@/types";

interface UseUserActivityOptions {
  user: User | null;
  inactivityTimeout?: number; // milliseconds, default 10 minutes
}

export const useUserActivity = ({
  user,
  inactivityTimeout = 5 * 1000 * 60, // 5 minutes
}: UseUserActivityOptions) => {
  const currentStatusRef = useRef<UserStatus>("online");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  // Debounced status update to prevent rapid API calls
  const updateStatus = useCallback(
    async (newStatus: UserStatus) => {
      if (
        !user ||
        currentStatusRef.current === newStatus ||
        isUpdatingRef.current
      ) {
        return;
      }

      isUpdatingRef.current = true;

      try {
        const result = await updateUserStatus(user, newStatus);
        if (result.success) {
          currentStatusRef.current = newStatus;
          if (newStatus === "online") {
            toast.success("Status automatically updated");
          }
        }
      } catch (error) {
        console.error("Failed to update user status:", error);
        toast.error("Failed to auto update your status");
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [user]
  );

  // Handle user activity - set to online if not already
  const handleActivity = useCallback(() => {
    // Clear existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set user to online if they were offline or brb
    if (currentStatusRef.current !== "online") {
      updateStatus("online");
    }

    // Start new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      updateStatus("brb");
    }, inactivityTimeout);
  }, [updateStatus, inactivityTimeout]);

  // Handle when user leaves/closes the page
  const handleBeforeUnload = useCallback(() => {
    // Use sendBeacon for reliable offline status update when page unloads
    if (user && currentStatusRef.current !== "offline") {
      // Synchronous call for page unload - this is a simplified approach
      // In production, consider using sendBeacon with your API endpoint
      updateStatus("offline");
    }
  }, [user, updateStatus]);

  // Handle visibility change (tab switch, minimize, etc.)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden - user might be away
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      // Set shorter timer when tab is hidden
      inactivityTimerRef.current = setTimeout(() => {
        updateStatus("brb");
      }, 30000); // 30 seconds when hidden
    } else {
      // Page is visible again - treat as activity
      handleActivity();
    }
  }, [handleActivity, updateStatus]);

  useEffect(() => {
    if (!user) return;

    // Activity events to monitor
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttled activity handler to prevent excessive calls
    let lastActivity = 0;
    const throttledActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 1000) {
        // Throttle to once per second
        lastActivity = now;
        handleActivity();
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initialize - set user to online and start activity tracking
    updateStatus("online");
    handleActivity();

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [
    user,
    handleActivity,
    handleVisibilityChange,
    handleBeforeUnload,
    updateStatus,
  ]);

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  return {
    currentStatus: currentStatusRef.current,
  };
};
