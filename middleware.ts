// middleware.ts - Root level for Next.js 14 App Router
// AUTHENTICATION DISABLED - Middleware commented out
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Custom middleware that allows public access to login page
export async function middleware(request: NextRequest) {
  // Authentication disabled - allow all routes
  return NextResponse.next();

  /* Original auth middleware - commented out
  // Allow access to the root page (login page), auth pages, and NextAuth API routes without authentication
  if (
    request.nextUrl.pathname === "/" || 
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // For all other routes, we'll allow the request to continue
  // Authentication checks will be handled by the client-side components
  return NextResponse.next();
  */
}

// Configure matcher to run middleware on all routes except static assets and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static (static files)
     */
    "/((?!_next/static|_next/image|favicon.ico|static|.*\\..*|_vercel).*)",
  ],
};