import { NextResponse } from "next/server";
import { getResidentSession, getAdminSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const residentSession = await getResidentSession();
  if (residentSession) {
    const jobs = store.listPrintJobsForResident(residentSession.residentId);
    return NextResponse.json({
      data: residentSession,
      type: "resident",
      jobs,
    });
  }
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json({ data: adminSession, type: "admin" });
  }
  return NextResponse.json({ data: null, type: "anonymous" });
}
