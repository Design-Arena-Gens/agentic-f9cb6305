import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const data = store.getCommunities();
  return NextResponse.json({ data });
}

