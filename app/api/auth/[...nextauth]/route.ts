import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// More explicit handler to ensure proper NextAuth routing
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };