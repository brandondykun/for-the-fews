import { NextRequest, NextResponse } from "next/server";

import { verifyIdToken } from "@/lib/firebase-admin";
import { getRateLimitStatus } from "@/lib/rateLimiter";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    let userId: string;
    try {
      const decodedToken = await verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (authError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Authentication failed:", authError);
      }
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Get current rate limit status without incrementing
    const rateLimitResult = await getRateLimitStatus(userId);

    return NextResponse.json({
      allowed: rateLimitResult.allowed,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime.toISOString(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error checking rate limit status:", error);
    }
    return NextResponse.json(
      { error: "Failed to check rate limit status" },
      { status: 500 }
    );
  }
}
