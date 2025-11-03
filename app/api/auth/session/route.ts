import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route"; // Import your NextAuth configuration
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    return NextResponse.json(session);
  } else {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  // For session creation/update, just return current session
  const session = await getServerSession(authOptions);
  
  if (session) {
    return NextResponse.json(session);
  } else {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }
}