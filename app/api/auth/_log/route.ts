import { NextResponse } from "next/server";

// NextAuth internal logging endpoint
export async function POST() {
  // NextAuth uses this endpoint for internal logging
  // Return success to prevent 405 errors
  return NextResponse.json({ message: "OK" });
}

export async function GET() {
  // Return 405 for non-POST requests as expected by NextAuth
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}