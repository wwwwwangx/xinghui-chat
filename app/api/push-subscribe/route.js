import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=disable"),
  ssl: false,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, session_id = "1" } = body;
    if (!subscription) {
      return NextResponse.json({ error: "no subscription" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id SERIAL PRIMARY KEY,
          session_id TEXT,
          subscription JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      // 每次覆盖，只保留最新的订阅
      await client.query("DELETE FROM push_subscriptions WHERE session_id = $1", [session_id]);
      await client.query(
        "INSERT INTO push_subscriptions (session_id, subscription) VALUES ($1, $2)",
        [session_id, JSON.stringify(subscription)]
      );
      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[push-subscribe]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}