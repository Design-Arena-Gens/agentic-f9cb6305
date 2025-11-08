import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/session";
import { store, type PrintJobStatus } from "@/lib/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { status } = await request.json();
  if (!status) {
    return NextResponse.json(
      { error: "Missing status" },
      { status: 400 },
    );
  }
  try {
    const job = store.updatePrintJobStatus(id, status as PrintJobStatus);
    return NextResponse.json({ data: job });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update" },
      { status: 400 },
    );
  }
}
