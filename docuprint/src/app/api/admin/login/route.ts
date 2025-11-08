import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createAdminSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const admin = store.findAdminByEmail(email);
  if (!admin || admin.password !== password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }
  const response = NextResponse.json({ data: { adminId: admin.id } });
  response.cookies.set(createAdminSessionCookie(admin.id));
  return response;
}

