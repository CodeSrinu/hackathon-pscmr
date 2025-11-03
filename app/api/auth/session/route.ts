import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (session) {
    return NextResponse.json(session);
  } else {
    // Return empty session instead of 401 to match NextAuth expectations
    return NextResponse.json({});
  }
}