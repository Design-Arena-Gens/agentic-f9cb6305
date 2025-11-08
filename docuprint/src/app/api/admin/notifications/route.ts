import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = store.listNotifications(session.adminId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { notificationId } = await request.json();
  if (!notificationId) {
    return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
  }
  const notification = store.markNotificationRead(
    notificationId,
    session.adminId,
  );
  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: notification });
}
