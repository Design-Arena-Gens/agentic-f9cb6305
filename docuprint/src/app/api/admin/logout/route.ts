import { NextResponse } from "next/server";
import { destroyAdminSessionCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(destroyAdminSessionCookie());
  return response;
}

