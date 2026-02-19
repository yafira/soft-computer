import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:logs";
const ADMIN_TOKEN = process.env.ADMIN_LOG_TOKEN || "";

function isAuthorized(req) {
  if (!ADMIN_TOKEN) return false;
  const got = (req.headers.get("x-admin-token") || "").trim();
  return got === ADMIN_TOKEN.trim();
}

function cleanEntry(e) {
  const id = String(e?.id || "").trim();
  const label = String(e?.label || "").trim();
  const text = String(e?.text || "").trim();
  const createdAt = Number(e?.createdAt || 0);
  if (!label || !text) return null;
  return {
    id: id || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`),
    label,
    text,
    createdAt:
      Number.isFinite(createdAt) && createdAt > 0 ? createdAt : Date.now(),
  };
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const cleaned = (Array.isArray(body?.entries) ? body.entries : [])
      .map(cleanEntry)
      .filter(Boolean)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    await redis.set(KEY, cleaned);
    return NextResponse.json({ ok: true, count: cleaned.length });
  } catch (err) {
    console.error("publish failed", err);
    return NextResponse.json({ error: "failed to publish" }, { status: 500 });
  }
}
