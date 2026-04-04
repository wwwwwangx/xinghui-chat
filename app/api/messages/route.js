import { NextResponse } from "next/server";

let messages = [];

export async function GET() {
  return NextResponse.json({ messages });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newMessages = body.messages || [];

    messages = newMessages;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "error" },
      { status: 500 }
    );
  }
}