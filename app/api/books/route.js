import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/books`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (e) {
    console.error("[GET /api/books]", e.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const res = await fetch(`${BACKEND}/books/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[POST /api/books]", e.message);
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