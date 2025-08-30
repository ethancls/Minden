import type { NextAuthOptions, Session, User } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AppleProvider from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import type { SessionUser } from '@/models/types';

function providers() {
  const list = [];

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
        clientSecret: process.env.APPLE_CLIENT_SECRET || '',
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
          // Only send magic link for existing users to avoid user enumeration.
          const { prisma } = await import('@/lib/prisma');
          const user = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
          if (!user) {
            // Do not send; silently ignore to avoid enumeration.
            return;
          }
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
        // Generic invalid credentials to avoid enumeration
        if (!user || !user.passwordHash) {
          throw new Error('INVALID_CREDENTIALS');
        }
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          throw new Error('INVALID_CREDENTIALS');
        }
        // Only after validating credentials, enforce email verification
        if (!user.emailVerified) {
          // Require verification for local login; use magic link to verify
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        return {
          id: user.id,
          email: user.email!,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        } satisfies User;
      },
    })
  );

  // Passkey provider (WebAuthn)
  list.push(
    CredentialsProvider({
      id: 'passkey',
      name: 'Passkey',
      credentials: {
        credential: { label: 'credential', type: 'text' },
        challengeId: { label: 'challengeId', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.credential || !credentials?.challengeId) return null;

          // Use our verification API route
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const verifyResponse = await fetch(`${baseUrl}/api/auth/webauthn/authentication/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              credential: JSON.parse(credentials.credential),
              challengeId: credentials.challengeId
            })
          });

          if (!verifyResponse.ok) {
            console.error('Passkey verification failed:', await verifyResponse.text());
            return null;
          }

          const result = await verifyResponse.json();
          
          if (result.verified && result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              image: result.user.image
            } satisfies User;
          }

          return null;
        } catch (error) {
          console.error('Passkey authentication error:', error);
          return null;
        }
      },
    })
  );

  return list;
}

const secureCookies = (process.env.NEXTAUTH_URL || '').startsWith('https://');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  useSecureCookies: secureCookies,
  pages: {
    signIn: '/en/auth/signin', // default fallback locale
  },
  providers: providers(),
  callbacks: {
    async session({ token, session }): Promise<Session & { user: SessionUser }> {
      if (token && session.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.sub!;
        sessionUser.role = (token.role as string) || 'USER';
        sessionUser.locale = (token.locale as string) || 'en';
      }
      return session as Session & { user: SessionUser };
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
