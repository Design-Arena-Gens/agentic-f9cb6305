import { NextResponse } from "next/server";
import { getResidentSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getResidentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = store.listPrintJobsForResident(session.residentId);
  return NextResponse.json({ data: jobs });
}

export async function POST(request: Request) {
  const session = await getResidentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const payload = store.validatePrintJob({
      ...body,
      residentId: session.residentId,
    });
    const job = store.createPrintJob(payload);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create print job";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
