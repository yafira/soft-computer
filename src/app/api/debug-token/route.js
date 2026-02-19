import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: process.env.ADMIN_LOG_TOKEN ?? "NOT SET",
    length: (process.env.ADMIN_LOG_TOKEN ?? "").length,
  });
}
