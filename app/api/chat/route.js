import { NextResponse } from "next/server";

export const maxDuration = 60; // 把超时从默认10秒延长到60秒

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

function parseTaggedResponse(rawText) {
  const text = String(rawText || "").trim();

  const reply = extractTag(text, "reply");
  const thoughtSummary = extractTag(text, "thoughtSummary");
  const thoughtFull = extractTag(text, "thoughtFull");

  return {
    reply,
    thoughtSummary,
    thoughtFull,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const gatewayUrl =
      "https://wangxandxing.zeabur.app/v1/chat/completions";

    let response;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000); // 55秒超时
      response = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr);

      return NextResponse.json(
        { error: "Failed to connect to gateway" },
        { status: 500 }
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Gateway JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "Gateway did not return valid JSON" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Gateway error status:", response.status);
      console.error("Gateway error data:", data);

      return NextResponse.json(data, { status: response.status });
    }

    const rawText =
      (data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      data.content ||
      "";

    const parsed = parseTaggedResponse(rawText);

    const reply = parsed.reply || rawText || "";
    const thoughtSummary = parsed.thoughtSummary || "他刚刚在想点什么";
    const thoughtFull = parsed.thoughtFull || "……";

    const replies = splitAssistantReply(reply);

    return NextResponse.json(
      {
        ...data,
        reply,
        replies,
        thoughtSummary,
        thoughtFull,
      },
      { status: response.status }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}