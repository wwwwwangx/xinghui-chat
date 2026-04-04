import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "messages.json");

function readMessages() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeMessages(messages) {
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

export async function GET() {
  const messages = readMessages();
  return NextResponse.json({ messages });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newMessages = body.messages || [];

    writeMessages(newMessages);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "error" },
      { status: 500 }
    );
  }
}