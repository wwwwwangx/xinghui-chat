import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const SESSION_ID = "default";

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT message_data FROM chat_messages WHERE session_id = $1 ORDER BY id ASC",
        [SESSION_ID]
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM chat_messages WHERE session_id = $1",
        [SESSION_ID]
      );

      for (const msg of newMessages) {
        await client.query(
          "INSERT INTO chat_messages (session_id, message_data) VALUES ($1, $2)",
          [SESSION_ID, JSON.stringify(msg)]
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