import { NextRequest, NextResponse } from "next/server";

import Together from "together-ai";

import {
  MAX_CONTENT_LENGTH,
  DEFAULT_TEMPERATURE,
  MAX_TOKENS,
} from "@/constants";
import { devError, devLog } from "@/lib/dev-utils";
import { verifyIdToken } from "@/lib/firebase-admin";
import { checkAndUpdateRateLimit } from "@/lib/rateLimiter";
import { buildSystemMessage } from "@/lib/utils";

const client = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export async function POST(request: NextRequest) {
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
      devLog("User authenticated successfully");
    } catch (authError) {
      devError("Authentication failed:", authError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check rate limit before processing the request
    const rateLimitResult = await checkAndUpdateRateLimit(userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Daily message limit exceeded",
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
        { status: 429 }
      );
    }

    const { messages, chatMode = "fart" } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Validate chatMode against allowed values
    const allowedChatModes = [
      "fart",
      "pirate",
      "linus",
      "minecraft",
      "comfort",
    ];
    if (!allowedChatModes.includes(chatMode)) {
      return NextResponse.json({ error: "Invalid chat mode" }, { status: 400 });
    }

    // Sanitize message content
    const sanitizedMessages = messages.map((msg) => ({
      ...msg,
      content: msg.content?.trim().slice(0, MAX_CONTENT_LENGTH), // Limit and trim content
    }));

    devLog(`Processing ${messages.length} messages for chat mode: ${chatMode}`);

    const systemMessage = buildSystemMessage(chatMode);

    // Create a streaming response
    const stream = await client.chat.completions.create({
      messages: [systemMessage, ...sanitizedMessages],
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      max_tokens: MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
      stream: true,
    });

    // Create a ReadableStream to send chunks to the frontend
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // Send each chunk as a JSON object
              const data = JSON.stringify({ content }) + "\n";
              controller.enqueue(encoder.encode(data));
            }
          }
          // Send a final chunk to indicate completion
          controller.enqueue(
            encoder.encode(JSON.stringify({ done: true }) + "\n")
          );
        } catch (error) {
          devError("Streaming error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
      },
    });
  } catch (error) {
    devError("Error calling Together AI:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
