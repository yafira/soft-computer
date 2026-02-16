import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:concept_images";

export async function GET() {
  if (!redis) return NextResponse.json({ images: [] });

  const raw = await redis.lrange(KEY, 0, 49);
  const images = (raw || [])
    .map((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({ images });
}
