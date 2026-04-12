import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=disable"),
  ssl: false,
});

// ✅ GET
export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT key, value FROM settings");

    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ settings: {} });
  } finally {
    client.release(); // ❗必须有
  }
}

// ✅ POST
export async function POST(req) {
  const client = await pool.connect();
  try {
    const { key, value } = await req.json();

    await client.query(
      `
      INSERT INTO settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value
      `,
      [key, value]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/settings]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release(); // ❗必须有
  }
}