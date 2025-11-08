import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const signups = store.listSignupsByAdmin(session.adminId);
  return NextResponse.json({ data: signups });
}
