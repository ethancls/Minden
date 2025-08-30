import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

export async function POST(req: NextRequest) {
  const rpID = new URL(process.env.NEXTAUTH_URL || req.url).hostname;
  
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    timeout: 60000,
  });

  // Store challenge for verification
  const challengeRecord = await prisma.webAuthnChallenge.create({ 
    data: { 
      userId: null, // No specific user for authentication challenge
      type: 'authentication', 
      challenge: options.challenge 
    } 
  });

  return NextResponse.json({
    ...options,
    challengeId: challengeRecord.id
  });
}
