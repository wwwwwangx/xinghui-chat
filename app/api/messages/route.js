import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=disable"),
  ssl: false,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id") || "default";

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT message_data FROM chat_messages WHERE session_id = $1 ORDER BY id ASC",
        [sessionId]
      );
      const messages = result.rows.map((row) => row.message_data);
      return NextResponse.json({ messages });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[GET /api/messages]", err);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newMessages = body.messages || [];
    const sessionId = body.session_id || "default";

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM chat_messages WHERE session_id = $1",
        [sessionId]
      );
      for (const msg of newMessages) {
        await client.query(
          "INSERT INTO chat_messages (session_id, message_data) VALUES ($1, $2)",
          [sessionId, JSON.stringify(msg)]
        );
      }
      await client.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[POST /api/messages]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
