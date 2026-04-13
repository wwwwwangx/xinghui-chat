import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export async function GET() {
  const res = await fetch(`${BACKEND}/books`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const res = await fetch(`${BACKEND}/books/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req) {
  const { id } = await req.json();
  const res = await fetch(`${BACKEND}/books/${id}`, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}