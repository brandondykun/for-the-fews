import { NextRequest, NextResponse } from "next/server";

import { verifyIdToken, adminDb } from "@/lib/firebase-admin";

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
      console.error("Debug: Authentication failed:", authError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Test Firebase Admin configuration
    const debugInfo: {
      timestamp: string;
      userId: string;
      environment: string | undefined;
      firebase: {
        projectId: string | undefined;
        clientEmailPresent: boolean;
        privateKeyPresent: boolean;
      };
      firestore?: { status: string; canWrite: boolean; error?: string };
      rateLimit?: {
        docId?: string;
        exists?: boolean;
        data?: Record<string, unknown> | null;
        error?: string;
      };
    } = {
      timestamp: new Date().toISOString(),
      userId: userId,
      environment: process.env.NODE_ENV,
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmailPresent: !!process.env.FIREBASE_CLIENT_EMAIL,
        privateKeyPresent: !!process.env.FIREBASE_PRIVATE_KEY,
      },
    };

    // Test Firestore connection
    try {
      const testDoc = adminDb.collection("rateLimits").doc("test");
      await testDoc.set({
        test: true,
        timestamp: new Date(),
      });
      await testDoc.delete();
      debugInfo.firestore = { status: "connected", canWrite: true };
    } catch (firestoreError) {
      console.error("Debug: Firestore test failed:", firestoreError);
      debugInfo.firestore = {
        status: "error",
        canWrite: false,
        error:
          firestoreError instanceof Error
            ? firestoreError.message
            : String(firestoreError),
      };
    }

    // Test rate limit document access
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const docId = `${userId}_${currentDate}`;
      const docRef = adminDb.collection("rateLimits").doc(docId);
      const doc = await docRef.get();

      debugInfo.rateLimit = {
        docId: docId,
        exists: doc.exists,
        data: doc.exists ? doc.data() : null,
      };
    } catch (rateLimitError) {
      console.error("Debug: Rate limit test failed:", rateLimitError);
      debugInfo.rateLimit = {
        error:
          rateLimitError instanceof Error
            ? rateLimitError.message
            : String(rateLimitError),
      };
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
