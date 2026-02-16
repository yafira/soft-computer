import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = "softcomputer:concept-images";
const ADMIN_TOKEN = process.env.ADMIN_UPLOAD_TOKEN || "";

// simple auth gate for write operations
function isAuthorized(req) {
  if (!ADMIN_TOKEN) return false;
  const got = req.headers.get("x-admin-token") || "";
  return got && got === ADMIN_TOKEN;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function GET() {
  try {
    const images = safeArray(await redis.get(KEY));
    return NextResponse.json({ images });
  } catch (err) {
    console.error("concept-images GET failed", err);
    return NextResponse.json(
      { error: "failed to load images" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const url = (body?.url || "").trim();
    const caption = (body?.caption || "").trim();

    if (!url) {
      return NextResponse.json({ error: "missing url" }, { status: 400 });
    }

    const images = safeArray(await redis.get(KEY));

    const item = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      url,
      caption,
      createdAt: Date.now(),
    };

    const next = [item, ...images];

    await redis.set(KEY, next);

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("concept-images POST failed", err);
    return NextResponse.json(
      { error: "failed to save image" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const id = (body?.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }

    const images = safeArray(await redis.get(KEY));
    const next = images.filter((img) => img?.id !== id);

    await redis.set(KEY, next);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("concept-images DELETE failed", err);
    return NextResponse.json(
      { error: "failed to delete image" },
      { status: 500 },
    );
  }
}
