import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email address.");
        }

        if (user.role === "SUSPENDED") {
          throw new Error("Your account has been suspended by an administrator.");
        }

        if (user.role === "BANNED") {
          throw new Error("Your account has been permanently banned by an administrator.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_client_secret",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          plan: "FREE"
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  events: {
    async createUser({ user }) {
      try {
        const { cookies } = await import("next/headers");
        const cStore = await cookies();
        const cookiePlatform = cStore.get("ourstory_platform")?.value;
        const finalPlatform = cookiePlatform ? decodeURIComponent(cookiePlatform) : "Google 🌐";

        await prisma.user.update({
          where: { id: user.id },
          data: { platform: finalPlatform } as any,
        });
      } catch (e) {
        console.error("Failed to set platform on Google user create:", e);
      }
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string }
          });
          if (dbUser) {
            token.role = dbUser.role || "USER";
            token.plan = dbUser.plan || "FREE";
          }
        } catch (e) {}
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = token.role as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "ourstory_secret_jwt_key_2026_production",
};
