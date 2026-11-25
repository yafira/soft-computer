import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData();

  const token = form.get("token");
  const tokenOk =
    !!process.env.ADMIN_UPLOAD_TOKEN && token === process.env.ADMIN_UPLOAD_TOKEN;
  if (!tokenOk && !(await isAdminRequest(req, "ADMIN_UPLOAD_TOKEN"))) {
    return new Response("unauthorized", { status: 401 });
  }

  const file = form.get("file");
  const entryId = form.get("entryId") || "concept";

  if (!file || typeof file === "string") {
    return new Response("missing file", { status: 400 });
  }

  const blob = await put(`softcomputer/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const record = {
    id: crypto.randomUUID(),
    url: blob.url,
    entryId,
    name: file.name,
    createdAt: Date.now(),
  };

  await kv.lpush(`images:${entryId}`, record);

  return Response.json({ ok: true, record });
}
