import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:logs";
const ADMIN_TOKEN = process.env.ADMIN_LOG_TOKEN || "";

function isAuthorized(req) {
  if (!ADMIN_TOKEN) return false;
  const got = (req.headers.get("x-admin-token") || "").trim();
  return got === ADMIN_TOKEN.trim();
}

export async function GET() {
  try {
    const raw = await redis.get(KEY);
    const entries = Array.isArray(raw) ? raw : [];
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("logs GET failed", err);
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const { id, label, text } = body;
    if (!label?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: "label and text required" },
        { status: 400 },
      );
    }
    const raw = await redis.get(KEY);
    const existing = Array.isArray(raw) ? raw : [];

    // upsert — replace if same id exists, otherwise prepend
    const entry = {
      id: id || globalThis.crypto.randomUUID(),
      label: label.trim(),
      text: text.trim(),
      createdAt: Date.now(),
    };
    const filtered = existing.filter((e) => e.id !== entry.id);
    await redis.set(KEY, [entry, ...filtered]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("logs POST failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    const raw = await redis.get(KEY);
    const existing = Array.isArray(raw) ? raw : [];
    await redis.set(
      KEY,
      existing.filter((e) => e.id !== id),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
