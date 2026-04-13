import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export const maxDuration = 60; // 延长超时时间至 60 秒，适合大文件上传

export async function GET() {
  const res = await fetch(`${BACKEND}/books`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req) {
  // 使用 text() 直接获取原始请求体，避免 Next.js 重新解析大 JSON 造成内存压力或限制
  const rawBody = await req.text();
  const res = await fetch(`${BACKEND}/books/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawBody,
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