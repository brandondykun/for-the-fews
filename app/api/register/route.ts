import { NextRequest, NextResponse } from "next/server";

import { devError } from "@/lib/dev-utils";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  checkAndUpdateRegistrationRateLimit,
  getClientIP,
} from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check registration rate limit before processing
    const rateLimitResult = await checkAndUpdateRegistrationRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
          },
        }
      );
    }

    const { email, password, displayName, joinCode } = await request.json();

    // Validate required fields
    if (!email || !password || !displayName || !joinCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get the active join code from Firestore
    const joinCodeQuery = await adminDb
      .collection("joinCode")
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (joinCodeQuery.empty) {
      return NextResponse.json(
        { error: "No active join code found" },
        { status: 500 }
      );
    }

    const activeJoinCodeDoc = joinCodeQuery.docs[0];
    const activeJoinCode = activeJoinCodeDoc.data()?.code;

    if (!activeJoinCode) {
      return NextResponse.json(
        { error: "Active join code is not properly configured" },
        { status: 500 }
      );
    }

    // Compare join codes
    if (joinCode !== activeJoinCode) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 400 });
    }

    // Create user with Firebase Admin
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
      });
    } catch (error: unknown) {
      devError("Error creating user:", error);
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/email-already-exists") {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 400 }
          );
        } else if (error.code === "auth/weak-password") {
          return NextResponse.json(
            { error: "Password is too weak" },
            { status: 400 }
          );
        } else if (error.code === "auth/invalid-email") {
          return NextResponse.json(
            { error: "Invalid email address" },
            { status: 400 }
          );
        }
      }
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Ensure userRecord was created successfully
    if (!userRecord) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Store additional user data in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      createdAt: new Date().toISOString(),
      joinCode: joinCode, // Store which join code was used
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
        },
      }
    );
  } catch (error) {
    devError("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
