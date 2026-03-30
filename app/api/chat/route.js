import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const gatewayUrl =
      "https://passionate-tenderness-production-b0a8.up.railway.app/v1/chat/completions";

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}