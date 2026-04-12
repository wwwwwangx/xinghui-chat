import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=disable"),
  ssl: false,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "active";
  const search = searchParams.get("search") || "";

  try {
    const client = await pool.connect();
    try {
      let query = `SELECT id, content, type, status, importance, created_at
                   FROM memories WHERE status = $1`;
      const params = [status];

      if (type) {
        params.push(type);
        query += ` AND type = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        query += ` AND content LIKE $${params.length}`;
      }

      query += " ORDER BY created_at DESC LIMIT 200";

      const result = await client.query(query, params);
      return NextResponse.json({ memories: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[GET /api/memories]", err);
    return NextResponse.json({ memories: [] });
  }
}

export async function PATCH(req) {
  try {
    const { id, status, importance } = await req.json();
    const client = await pool.connect();
    try {
      if (status !== undefined) {
        await client.query(
          "UPDATE memories SET status = $1, updated_at = NOW() WHERE id = $2",
          [status, id]
        );
      }
      if (importance !== undefined) {
        await client.query(
          "UPDATE memories SET importance = $1, updated_at = NOW() WHERE id = $2",
          [importance, id]
        );
      }
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[PATCH /api/memories]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req) {
  try {
    const { ids } = await req.json();
    const client = await pool.connect();

    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "ids is required" }, { status: 400 });
      }

      await client.query(
        "DELETE FROM memories WHERE id = ANY($1::int[])",
        [ids]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[DELETE /api/memories]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}