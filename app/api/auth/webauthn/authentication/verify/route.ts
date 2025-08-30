import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { WebAuthnCredential, AuthenticatorTransport } from '@simplewebauthn/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, challengeId } = body;

    if (!credential || !challengeId) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }

    // Get challenge record
    const challengeRecord = await prisma.webAuthnChallenge.findUnique({
      where: { id: challengeId }
    });
    
    if (!challengeRecord) {
      return NextResponse.json({ error: 'NO_CHALLENGE' }, { status: 400 });
    }

    // Find credential in database
    const dbCredential = await prisma.webAuthnCredential.findFirst({
      where: { credentialId: credential.id },
      include: { user: true }
    });

    if (!dbCredential || !dbCredential.user) {
      console.error('Credential not found in database:', credential.id);
      return NextResponse.json({ error: 'CREDENTIAL_NOT_FOUND' }, { status: 400 });
    }


    const rpUrl = process.env.NEXTAUTH_URL || req.url;
    const origin = new URL(rpUrl).origin;
    const rpID = new URL(rpUrl).hostname;

    // Prepare credential object for verification using correct v13 WebAuthnCredential structure
    const webauthnCredential: WebAuthnCredential = {
      id: dbCredential.credentialId, // Note: id instead of credentialID
      publicKey: new Uint8Array(Buffer.from(dbCredential.publicKey, 'base64url')),
      counter: Number(dbCredential.counter || 0),
      transports: (dbCredential.transports || '').split(',').filter(Boolean) as AuthenticatorTransport[]
    };

    console.log('Attempting WebAuthn verification for credential:', dbCredential.credentialId);

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: webauthnCredential // Changed from authenticator to credential
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'VERIFICATION_FAILED' }, { status: 400 });
    }

    // Update counter and clean up challenge
    const newCounter = verification.authenticationInfo.newCounter;
    await prisma.webAuthnCredential.update({
      where: { id: dbCredential.id },
      data: { counter: newCounter, lastUsedAt: new Date() }
    });
    
    await prisma.webAuthnChallenge.delete({ where: { id: challengeId } });

    // Return user data for NextAuth
    return NextResponse.json({
      verified: true,
      user: {
        id: dbCredential.user.id,
        email: dbCredential.user.email,
        name: dbCredential.user.name,
        image: dbCredential.user.image
      }
    });

  } catch (error: unknown) {
    console.error('Authentication verification error:', error);
    return NextResponse.json({ error: 'VERIFICATION_FAILED' }, { status: 400 });
  }
}

