import type { NextAuthOptions, Session } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AppleProvider from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';

function providers() {
  const list: any[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    list.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    );
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    list.push(
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      })
    );
  }
  if (
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY
  ) {
    list.push(
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID!,
        clientSecret: {
          privateKey: process.env.APPLE_PRIVATE_KEY!.split(/\\n/).join('\n'),
          keyId: process.env.APPLE_KEY_ID!,
          teamId: process.env.APPLE_TEAM_ID!,
        },
      })
    );
  }

  // Email Magic Link (verification required)
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_FROM
  ) {
    list.push(
      EmailProvider({
        server: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: process.env.SMTP_USER
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              }
            : undefined,
        },
        from: process.env.SMTP_FROM,
        // Custom email template for magic links
        async sendVerificationRequest({ identifier, url }) {
          const { sendMagicLinkEmail, guessLocaleFromUrl } = await import('@/lib/email');
          const locale = guessLocaleFromUrl(url);
          await sendMagicLinkEmail(identifier, url, locale);
        },
      })
    );
  }

  // Credentials (email + password) with email verification enforced
  list.push(
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) {
          throw new Error('USER_NOT_FOUND');
        }
        if (!user.emailVerified) {
          // Require verification for local login; use magic link to verify
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          throw new Error('INVALID_PASSWORD');
        }
        return {
          id: user.id,
          email: user.email!,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        } as any;
      },
    })
  );

  return list;
}

const secureCookies = (process.env.NEXTAUTH_URL || '').startsWith('https://');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  useSecureCookies: secureCookies,
  pages: {
    signIn: '/en/auth/signin', // default fallback locale
  },
  providers: providers(),
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role || 'USER';
        (session.user as any).locale = (token as any).locale || 'en';
      }
      return session as Session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.role = dbUser?.role || 'USER';
        token.locale = dbUser?.locale || 'en';
        // Update primary provider on first login
        if (account?.provider) {
          await prisma.user.update({
            where: { id: user.id },
            data: { primaryProvider: account.provider.toUpperCase() },
          });
        }
      }
      return token;
    },
  },
};
