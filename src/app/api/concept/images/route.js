import { kv } from "@/lib/kv";

const KEY = "softcomputer:concept_images";

function requireAdmin(request) {
  const token = request.headers.get("x-admin-token");
  return token && token === process.env.ADMIN_UPLOAD_TOKEN;
}

export async function GET() {
  const items = (await kv.lrange(KEY, 0, 99)) || [];
  // stored newest-first, so reverse for display if you want chronological
  return Response.json({ images: items });
}

export async function POST(request) {
  if (!requireAdmin(request)) {
    return new Response("unauthorized", { status: 401 });
  }

  const { url, caption = "" } = await request.json();
  if (!url) return new Response("missing url", { status: 400 });

  const item = {
    id: crypto.randomUUID(),
    url,
    caption,
    createdAt: Date.now(),
  };

  // newest first
  await kv.lpush(KEY, item);

  return Response.json({ ok: true, item });
}

export async function DELETE(request) {
  if (!requireAdmin(request)) {
    return new Response("unauthorized", { status: 401 });
  }

  const { id } = await request.json();
  if (!id) return new Response("missing id", { status: 400 });

  const items = (await kv.lrange(KEY, 0, 99)) || [];
  const keep = items.filter((x) => x?.id !== id);

  await kv.del(KEY);
  if (keep.length) {
    // re-add in order (newest first)
    for (let i = keep.length - 1; i >= 0; i--) await kv.lpush(KEY, keep[i]);
  }

  return Response.json({ ok: true });
}
