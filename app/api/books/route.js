import { NextResponse } from "next/server";

export const maxDuration = 120; // 延长到 120 秒，匹配 POST 超时
export const dynamic = 'force-dynamic';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // GET 改 30 秒
    const res = await fetch(`${BACKEND}/books`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e) {
    console.error("[GET /api/books] 失败:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // POST 改 120 秒
    const res = await fetch(`${BACKEND}/books/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[POST /api/books] 失败:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const res = await fetch(`${BACKEND}/books/${id}`, { method: "DELETE" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}