import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  providers: [
    Google,
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim().toLowerCase();
        const password = String(credentials?.password || '');

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { credential: true },
        });

        if (!user?.credential) return null;

        const isValid = await compare(password, user.credential.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
