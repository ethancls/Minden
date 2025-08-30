import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  
  const rpName = 'Minden';
  const rpUrl = process.env.NEXTAUTH_URL || req.url;
  const rpID = new URL(rpUrl).hostname;
  
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    select: { email: true, name: true } 
  });
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // Get existing credentials to exclude
  const existingCredentials = await prisma.webAuthnCredential.findMany({ 
    where: { userId }, 
    select: { credentialId: true } 
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email || userId,
    userID: isoUint8Array.fromUTF8String(userId),
    userDisplayName: user.name || user.email || 'User',
    attestationType: 'none',
    excludeCredentials: existingCredentials.map(cred => ({
      id: cred.credentialId,
      type: 'public-key' as const
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  });

  // Store challenge for verification
  await prisma.webAuthnChallenge.create({ 
    data: { 
      userId, 
      type: 'registration', 
      challenge: options.challenge 
    } 
  });

  return NextResponse.json(options);
}
