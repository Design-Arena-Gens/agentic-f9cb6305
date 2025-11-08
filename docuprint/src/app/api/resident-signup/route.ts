import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = store.validateSignup(body);
    const signup = store.createSignup(payload);
    return NextResponse.json(
      { data: signup, message: "Signup submitted for approval" },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process signup";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

