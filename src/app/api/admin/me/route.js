import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const admin = jar.get("sc_admin")?.value === "1";
  return NextResponse.json({ admin });
}
