import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieValue } from "@/lib/adminAuth";

const PASSWORD = process.env.ADMIN_LOG_PASSWORD;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body?.password || "");

    if (!PASSWORD || password !== PASSWORD) {
      return NextResponse.json({ error: "invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set(ADMIN_COOKIE, await adminCookieValue(), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
