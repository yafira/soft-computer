import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:logs";
// signed-in admin, or a script sending the server-side token
function isAuthorized(req) {
  return isAdminRequest(req, "ADMIN_LOG_TOKEN");
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
  if (!(await isAuthorized(req))) {
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
