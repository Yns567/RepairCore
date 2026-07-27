import type { NextAuthConfig } from "next-auth";

// IMPORTANT: this file must stay free of Node-only imports (Prisma, bcrypt, fs, etc).
// It is loaded by middleware.ts, which runs on the Edge Runtime and cannot use
// Node.js built-ins such as node:path / node:url (which Prisma's generated
// client pulls in). Anything that needs the database or bcrypt belongs in
// auth.ts instead, which only runs in the regular Node.js runtime.

export default {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
