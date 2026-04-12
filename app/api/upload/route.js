import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "application/octet-stream";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return NextResponse.json({
    url: dataUrl,
    name: file.name,
  });
}