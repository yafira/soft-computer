export async function PUT(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const images = safeArray(body?.images);

    if (images.length === 0) {
      return NextResponse.json({ error: "missing images" }, { status: 400 });
    }

    // save the array in the exact order provided
    await redis.set(KEY, images);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("concept-images PUT failed", err);
    return NextResponse.json(
      { error: "failed to save order" },
      { status: 500 },
    );
  }
}
