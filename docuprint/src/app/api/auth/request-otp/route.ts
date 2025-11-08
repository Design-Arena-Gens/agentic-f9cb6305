import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile } = store.validateOtpPayload(body);
    const resident = store.findResidentByMobile(mobile);
    if (!resident) {
      return NextResponse.json(
        { error: "Resident not found or pending approval" },
        { status: 404 },
      );
    }
    const code = store.createOtp(mobile);
    return NextResponse.json({
      data: { mobile, code },
      message:
        "OTP generated. In production this would be sent via SMS. For demo purposes it is returned here.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to request OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

