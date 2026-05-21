import "server-only";

import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@/generated/prisma/enums";
import { getDefaultFromAddress, isEmailConfigured, sendEmail } from "@/lib/email/resend";
import { getPrisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function findUserByEmail(email: string) {
  return getPrisma().user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, role: true, passwordHash: true, email: true },
  });
}

function isMagicLinkBlocked(user: { role: UserRole; passwordHash: string | null } | null) {
  if (!user) return false;
  return user.role === "admin" || Boolean(user.passwordHash);
}

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
          where: { email: parsed.data.email.trim().toLowerCase() },
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

  if (isEmailConfigured()) {
    list.push({
      id: "email",
      type: "email",
      name: "Email",
      from: getDefaultFromAddress(),
      maxAge: 24 * 60 * 60,
      normalizeIdentifier(identifier) {
        return identifier.trim().toLowerCase();
      },
      async sendVerificationRequest({ identifier, url }) {
        const existing = await findUserByEmail(identifier);
        if (isMagicLinkBlocked(existing)) {
          throw new Error("Magic link sign-in is not available for this account.");
        }

        await sendEmail({
          to: identifier,
          subject: "Sign in to Whobrey Studios",
          html: `
              <p>Click the link below to sign in to your client portal. This link expires in 24 hours.</p>
              <p><a href="${url}">Sign in to Whobrey Studios</a></p>
              <p>If you did not request this email, you can ignore it.</p>
            `.trim(),
          text: `Sign in to Whobrey Studios: ${url}\n\nIf you did not request this email, you can ignore it.`,
        });
      },
    });
  }

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
    verifyRequest: "/login/check-email",
    error: "/login/studio",
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await getPrisma().user.update({
        where: { id: user.id },
        data: { role: "client", passwordHash: null },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email") {
        const email = user.email?.trim().toLowerCase();
        if (!email) return false;

        const dbUser = await findUserByEmail(email);
        if (isMagicLinkBlocked(dbUser)) return false;

        // WHO-21: linkProjectsByContactEmail(dbUser?.id ?? user.id, email)
      }
      return true;
    },
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/post-login`;
    },
  },
});
