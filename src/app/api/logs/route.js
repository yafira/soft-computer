import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:logs";
const ADMIN_TOKEN = process.env.ADMIN_LOG_TOKEN || "";

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function parseLabel(label) {
  const parts = String(label || "")
    .toLowerCase()
    .trim()
    .split(/\s+/);
  const m = months.indexOf(parts[0]);
  const d = parseInt(parts[1]) || 0;
  return m * 31 + d;
}

function isAuthorized(req) {
  if (!ADMIN_TOKEN) return false;
  return (req.headers.get("x-admin-token") || "").trim() === ADMIN_TOKEN.trim();
}

// migrate legacy entry to content blocks — images go at end
function normaliseEntry(e) {
  if (!e) return e;
  if (Array.isArray(e.content) && e.content.length > 0) return e;

  const blocks = [];
  const text = typeof e.text === "string" ? e.text.trim() : "";
  if (text) blocks.push({ type: "text", value: text });

  const urls = Array.isArray(e.imageUrls)
    ? e.imageUrls
    : typeof e.imageUrl === "string" && e.imageUrl.trim()
      ? [e.imageUrl.trim()]
      : [];

  for (const url of urls) {
    if (url) blocks.push({ type: "image", url });
  }

  const { text: _t, imageUrls: _iu, imageUrl: _i, ...rest } = e;
  return { ...rest, content: blocks };
}

// derive compat fields from content so PunchCard + TimelinePreview still work
function deriveCompat(content) {
  const text = content
    .filter((b) => b.type === "text")
    .map((b) => b.value || "")
    .join("\n\n");
  const imageUrls = content
    .filter((b) => b.type === "image")
    .map((b) => b.url || "")
    .filter(Boolean);
  return { text, imageUrls };
}

function validateBlocks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => {
      if (b?.type === "text")
        return { type: "text", value: String(b.value || "").trimEnd() };
      if (b?.type === "image") {
        const url = String(b.url || "").trim();
        if (!url) return null;
        return { type: "image", url };
      }
      return null;
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const raw = await redis.get(KEY);
    const entries = (Array.isArray(raw) ? raw : []).map(normaliseEntry);
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
    const { id, label, content: rawContent } = body;

    if (!label?.trim()) {
      return NextResponse.json({ error: "label required" }, { status: 400 });
    }

    const content = validateBlocks(rawContent);
    if (content.length === 0) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const compat = deriveCompat(content);
    const raw = await redis.get(KEY);
    const existing = Array.isArray(raw) ? raw : [];

    const entry = {
      id: id || globalThis.crypto.randomUUID(),
      label: label.trim(),
      content,
      text: compat.text,
      imageUrls: compat.imageUrls,
      createdAt: Date.now(),
    };

    const filtered = existing.filter((e) => e.id !== entry.id);
    const sorted = [entry, ...filtered].sort(
      (a, b) => parseLabel(b.label) - parseLabel(a.label),
    );

    await redis.set(KEY, sorted);
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
