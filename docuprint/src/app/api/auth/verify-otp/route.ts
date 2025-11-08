import { NextResponse } from "next/server";
import {
  createResidentSessionCookie,
  destroyResidentSessionCookie,
} from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  const { mobile, code } = await request.json();
  if (!mobile || !code) {
    return NextResponse.json(
      { error: "Mobile and OTP are required" },
      { status: 400 },
    );
  }
  const resident = store.findResidentByMobile(mobile);
  if (!resident) {
    return NextResponse.json(
      { error: "Resident not found" },
      { status: 404 },
    );
  }
  const isValid = store.verifyOtp(mobile, code);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 401 },
    );
  }
  const response = NextResponse.json({
    data: { residentId: resident.id, mobile },
  });
  response.cookies.set(
    createResidentSessionCookie({
      residentId: resident.id,
      mobile,
    }),
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(destroyResidentSessionCookie());
  return response;
}

