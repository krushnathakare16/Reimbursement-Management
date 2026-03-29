import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@company.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        });

        // Basic string-matching auth for rapid hackathon testing
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyCurrency: user.company.baseCurrency
          } as any;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyCurrency = user.companyCurrency;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
            ...session.user,
            id: token.sub as string,
            role: token.role as string,
            companyId: token.companyId as string,
            companyCurrency: token.companyCurrency as string
        } as any
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }, // We will build this custom page using your mockup next!
  secret: process.env.NEXTAUTH_SECRET || "odoo-hackathon-super-secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
