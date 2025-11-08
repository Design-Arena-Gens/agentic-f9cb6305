import { NextResponse } from "next/server";
import { getResidentSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getResidentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resident = store.findResidentByMobile(session.mobile);
  if (!resident) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }
  return NextResponse.json({ data: resident });
}
