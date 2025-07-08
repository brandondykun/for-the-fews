/**
 * Check if the app is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Log to console only in development mode
 */
export function devLog(message: string, data?: unknown): void {
  if (isDevelopment()) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

/**
 * Log errors to console only in development mode
 */
export function devError(message: string, error?: unknown): void {
  if (isDevelopment()) {
    if (error !== undefined) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
}

/**
 * Log warnings to console only in development mode
 */
export function devWarn(message: string, data?: unknown): void {
  if (isDevelopment()) {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
}
