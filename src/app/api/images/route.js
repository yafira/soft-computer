import { kv } from "@/lib/kv";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("entryId") || "concept";

  const items = (await kv.lrange(`images:${entryId}`, 0, 50)) || [];

  return Response.json({ entryId, items });
}
