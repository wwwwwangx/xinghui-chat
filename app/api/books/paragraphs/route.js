import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://wangxandxing.zeabur.app";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "30";

    const res = await fetch(
      `${BACKEND}/books/${bookId}/paragraphs?page=${page}&page_size=${pageSize}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}