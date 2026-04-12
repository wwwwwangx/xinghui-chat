import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=disable"),
  ssl: false,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT key, value FROM settings");
      const settings = {};
      result.rows.forEach((row) => { settings[row.key] = row.value; });
      return NextResponse.json({ settings });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(req) {
  try {
    const { key, value } = await req.json();
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[POST /api/settings]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
