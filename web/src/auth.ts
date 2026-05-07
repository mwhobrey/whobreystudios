import "server-only";

import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function buildProviders(): NextAuthConfig["providers"] {
  const list: NextAuthConfig["providers"] = [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await getPrisma().user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ];

  const ghId = process.env.AUTH_GITHUB_ID;
  const ghSecret = process.env.AUTH_GITHUB_SECRET;
  if (ghId && ghSecret) {
    list.push(
      GitHub({
        clientId: ghId,
        clientSecret: ghSecret,
      }),
    );
  }

  return list;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(getPrisma()),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: buildProviders(),
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Only hit DB on sign-in; afterward role lives on the JWT.
      if (user?.id) {
        const dbUser = await getPrisma().user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, email: true, name: true, image: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.email = dbUser.email ?? undefined;
          token.name = dbUser.name ?? undefined;
          token.picture = dbUser.image ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
      }
      return session;
    },
  },
});
