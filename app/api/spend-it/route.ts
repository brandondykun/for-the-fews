import { NextRequest, NextResponse } from "next/server";

import Together from "together-ai";

import {
  MAX_CONTENT_LENGTH,
  DEFAULT_TEMPERATURE,
  MAX_TOKENS,
} from "@/constants";
import { devError, devLog } from "@/lib/dev-utils";
import { verifyIdToken } from "@/lib/firebase-admin";

const client = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Function to parse price from AI response with ===number=== format
function parsePrice(text: string): number | null {
  // Look for the specific ===number=== pattern
  const pricePattern = /===(\d+)===/;
  const match = text.match(pricePattern);

  if (match && match[1]) {
    const price = parseInt(match[1], 10);

    // Validate it's a positive number price
    if (!isNaN(price) && price > 0) {
      return price;
    }
  }

  return null;
}

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
      devLog(`User ${userId} authenticated successfully for price game`);
    } catch (authError) {
      devError("Authentication failed:", authError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { itemKey } = await request.json();

    if (!itemKey || typeof itemKey !== "string") {
      return NextResponse.json(
        { error: "Item key is required and must be a string" },
        { status: 400 }
      );
    }

    // Sanitize item key
    const sanitizedItemKey = itemKey.trim().slice(0, MAX_CONTENT_LENGTH);

    if (!sanitizedItemKey) {
      return NextResponse.json(
        { error: "Item key cannot be empty" },
        { status: 400 }
      );
    }

    devLog(`Processing price estimation for item: ${sanitizedItemKey}`);

    // Create prompt for price estimation
    const prompt = `Please estimate the current market price for "${sanitizedItemKey}". Provide only a whole dollar amount (no cents) with no other text, no dollar sign, and no commas. Return the number between three equal signs like the following example: ===10500===. Do not include any other text or explanation.`;

    const systemMessage = {
      role: "system" as const,
      content:
        "You provide price estimates. Always respond with ONLY a whole dollar number (no cents) between three equal signs like ===10500===. Do not respond with other text, explanations, dollar signs, or commas. Just the number between three equal signs. If an item is difficult to estimate, use your best guess.",
    };

    const userMessage = {
      role: "user" as const,
      content: prompt,
    };

    let price: number;
    let aiResponse = "";
    let error: string | null = null;

    try {
      // Call Together AI API (non-streaming for easier parsing)
      const completion = await client.chat.completions.create({
        messages: [systemMessage, userMessage],
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        max_tokens: MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
        stream: false,
      });

      aiResponse = completion.choices[0]?.message?.content || "";
      devLog("AI response received:", aiResponse);

      // Parse price from AI response
      const parsedPrice = parsePrice(aiResponse);

      if (parsedPrice !== null) {
        price = parsedPrice;
        devLog(`Successfully parsed price: $${price}`);
      } else {
        // Fallback to 0 price if parsing fails
        price = 0;
        error = "Could not buy that item from the current owner";
        devLog("Price parsing failed:", aiResponse);
      }
    } catch (aiError) {
      devError("Error calling Together AI:", aiError);
      price = 0;
      error = "Could not buy that item from the current owner";
      devLog("Together AI call failed:", aiError);
    }

    return NextResponse.json({
      itemKey: sanitizedItemKey,
      price: price,
      formattedPrice: `$${price.toFixed(2)}`,
      aiResponse: aiResponse || null,
      error: error,
    });
  } catch (error) {
    devError("Unexpected error in price game endpoint:", error);

    // Even in case of unexpected errors, return 0 price
    const fallbackPrice = 0;

    return NextResponse.json(
      {
        price: fallbackPrice,
        formattedPrice: `$${fallbackPrice.toFixed(2)}`,
        error: "Unexpected server error, returned 0 price",
      },
      { status: 500 }
    );
  }
}
