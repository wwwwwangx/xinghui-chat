import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function splitAssistantReply(text) {
  if (!text) return [];
  return text
    .split(/\n|(?<=[。！？.!?])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractTag(text, tagName) {
  if (!text) return "";
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}


export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

    const gatewayUrl = "https://wangxandxing.zeabur.app/v1/chat/completions";

    let response;
    try {
      response = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let data = {};
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({ error: "Gateway did not return valid JSON" }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const rawText = data?.choices?.[0]?.message?.content || data?.content || "";
    const reply = extractTag(rawText, "reply") || rawText || "";
    const thoughtSummary = extractTag(rawText, "thoughtSummary") || "他刚刚在想点什么";
    const thoughtFull = extractTag(rawText, "thoughtFull") || "……";
    const replies = splitAssistantReply(reply);

    return NextResponse.json({
      ...data, reply, replies, thoughtSummary, thoughtFull,
    }, { status: response.status });

  } catch (err) {
    console.error("Unexpected error:", err.message);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}