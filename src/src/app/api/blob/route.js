import { handleUpload } from "@vercel/blob/client";

export async function POST(request) {
  const body = await request.json();

  const jsonResponse = await handleUpload({
    request,
    body,
    onBeforeGenerateToken: async (pathname) => {
      return {
        allowedContentTypes: ["image/*"],
        addRandomSuffix: true,
      };
    },
    onUploadCompleted: async () => {
      // optional: you could log or do something here
    },
  });

  return Response.json(jsonResponse);
}
