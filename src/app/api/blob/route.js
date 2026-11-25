import { handleUpload } from "@vercel/blob/client";
import { isAdminRequest } from "@/lib/adminAuth";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      // only a signed-in admin can get an upload token
      onBeforeGenerateToken: async () => {
        if (!(await isAdminRequest(request))) throw new Error("unauthorized");
        return {
          allowedContentTypes: ["image/*"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(jsonResponse);
  } catch (err) {
    return Response.json(
      { error: String(err?.message || err) },
      { status: 401 },
    );
  }
}
