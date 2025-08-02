import { NextRequest, NextResponse } from "next/server";

import { devError, devLog } from "@/lib/dev-utils";
import { verifyIdToken } from "@/lib/firebase-admin";

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
    // let userId: string;
    try {
      await verifyIdToken(idToken);
      // userId = decodedToken.uid;
      devLog("User authenticated successfully for image generation");
    } catch (authError) {
      devError("Authentication failed:", authError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // // Check rate limit before processing the request
    // const rateLimitResult = await checkAndUpdateRateLimit(userId);

    // if (!rateLimitResult.allowed) {
    //   return NextResponse.json(
    //     {
    //       error: "Daily limit exceeded",
    //       remaining: rateLimitResult.remaining,
    //       resetTime: rateLimitResult.resetTime.toISOString(),
    //     },
    //     { status: 429 }
    //   );
    // }

    const { prompt } = await request.json();

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Sanitize and validate prompt length
    const sanitizedPrompt = prompt.trim();
    if (sanitizedPrompt.length === 0) {
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    if (sanitizedPrompt.length > 1000) {
      return NextResponse.json(
        { error: "Prompt too long. Maximum 1000 characters allowed." },
        { status: 400 }
      );
    }

    devLog(
      `Processing image generation request with prompt length: ${sanitizedPrompt.length}`
    );

    // Generate image using Together AI REST API
    const togetherResponse = await fetch(
      "https://api.together.xyz/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: sanitizedPrompt,
          model: "black-forest-labs/FLUX.1-schnell-Free",
          steps: 4,
          width: 1024,
          height: 1024,
          response_format: "base64",
          n: 1,
        }),
      }
    );

    if (!togetherResponse.ok) {
      const errorData = await togetherResponse.text();
      devError("Together AI API error:", errorData);

      if (togetherResponse.status === 429) {
        return NextResponse.json(
          { error: "Together AI rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (togetherResponse.status === 400) {
        return NextResponse.json(
          {
            error:
              "Invalid request or content policy violation. Please try a different prompt.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    const responseData = await togetherResponse.json();

    // Extract the image data from the response
    if (!responseData.data || responseData.data.length === 0) {
      return NextResponse.json(
        { error: "No image data received from Together AI" },
        { status: 500 }
      );
    }

    const imageData = responseData.data[0];

    // Return the base64 image data
    return NextResponse.json(
      {
        success: true,
        image: {
          b64_json: imageData.b64_json || null,
          revised_prompt: imageData.revised_prompt || sanitizedPrompt,
        },
        usage: responseData.usage || null,
      },
      {
        status: 200,
        // headers: {
        //   "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        //   "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
        // },
      }
    );
  } catch (error) {
    devError("Error generating image:", error);

    // Handle network or other unexpected errors
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = error.message as string;

      if (errorMessage.includes("fetch")) {
        return NextResponse.json(
          { error: "Network error. Please try again later." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
