import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Email and password are required');
          return null;
        }

        // Demo credentials for testing (no external database required)
        const DEMO_USERS = [
          { id: 'demo-user-1', email: 'demo@careerquest.com', password: 'demo123', name: 'Demo User' },
          { id: 'demo-user-2', email: 'test@test.com', password: 'test123', name: 'Test User' },
          { id: 'demo-user-3', email: 'user@example.com', password: 'user123', name: 'Example User' },
        ];

        // Check if credentials match a demo user
        const demoUser = DEMO_USERS.find(
          user => user.email === credentials.email && user.password === credentials.password
        );

        if (demoUser) {
          console.log('✅ Demo user authenticated:', demoUser.email);
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          };
        }

        // No match found
        console.error('❌ Invalid credentials. Use demo credentials.');
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Set to true if using issued/expiration times for JWT
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token, user }) {
      // Add the user id to the session object
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }

      // Ensure session is properly structured
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub || user?.id || session.user?.id
        }
      };
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      // The profile type varies depending on the provider
      // For Google provider, we check for sub from account.providerAccountId
      if (profile) {
        token.sub = profile.sub ?? token.sub;
      }

      // Include user id in token for consistency
      if (user) {
        token.sub = user.id ?? token.sub;
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    error: "/auth/error",
    signIn: "/",
  },
  // Add debug mode in development
  debug: process.env.NODE_ENV === 'development',
};