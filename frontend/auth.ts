import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from "@/lib/login-throttle";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

// This file is safe to import Prisma/bcrypt in: it is only ever loaded from
// Node.js server code (server components, route handlers, server actions),
// never from middleware.ts (which uses auth.config.ts directly instead).

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;
        if (await isLoginLocked(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        const isValid = Boolean(user?.hashedPassword) && await bcrypt.compare(password, user!.hashedPassword!);
        if (!user || !isValid) {
          await recordLoginFailure(email);
          return null;
        }
        await clearLoginFailures(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
