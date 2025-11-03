import { NextResponse } from "next/server";

// NextAuth logging endpoint - often used for debugging
export async function POST(request: Request) {
  try {
    // Log request for debugging purposes
    console.log("NextAuth _log endpoint called:", await request.json());
    return NextResponse.json({ message: "Log received" });
  } catch (error) {
    console.error("Error in _log endpoint:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ message: "Log endpoint - use POST" });
}