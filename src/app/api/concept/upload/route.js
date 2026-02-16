import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { redis } from "@/lib/redis";

const KEY = "softcomputer:concept_images";

export async function POST(request) {
  if (!redis) {
    return NextResponse.json(
      { error: "redis is not configured" },
      { status: 500 },
    );
  }

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    // keeps the uploader private (only you locally).
    // visitors still see the images because the gallery reads from kv + blob.
    return NextResponse.json({ error: "upload disabled" }, { status: 403 });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // you can add stricter checks here later (password, header token, etc)
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ kind: "concept-image" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // store newest first
        const item = {
          url: blob.url,
          pathname: blob.pathname,
          uploadedAt: Date.now(),
        };

        await redis.lpush(KEY, JSON.stringify(item));
        // keep it from growing forever (optional)
        await redis.ltrim(KEY, 0, 49);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "upload failed" },
      { status: 400 },
    );
  }
}
