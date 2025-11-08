import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { notes } = await request.json().catch(() => ({ notes: undefined }));
  try {
    const result = store.approveSignup(id, session.adminId, notes);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve" },
      { status: 400 },
    );
  }
}
