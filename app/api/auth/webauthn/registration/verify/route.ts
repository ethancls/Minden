import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyRegistrationResponse } from '@simplewebauthn/server';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const body = await _req.json();
  const { name, credential } = body;

  if (!credential) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const rpUrl = process.env.NEXTAUTH_URL || _req.url;
  const origin = new URL(rpUrl).origin;
  const rpID = new URL(rpUrl).hostname;
  const last = await prisma.webAuthnChallenge.findFirst({ where: { userId, type: 'registration' }, orderBy: { createdAt: 'desc' } });
  if (!last) return NextResponse.json({ error: 'NO_CHALLENGE' }, { status: 400 });
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: last.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error: unknown) {
    // Handle specific SimpleWebAuthn errors
    if (error instanceof Error && error.message && error.message.includes("authenticator was previously registered")) {
      return NextResponse.json({ error: 'AUTHENTICATOR_PREVIOUSLY_REGISTERED' }, { status: 400 });
    }
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'VERIFICATION_FAILED' }, { status: 400 });
  }
  
  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'VERIFICATION_FAILED' }, { status: 400 });
  }
  
  // Extract credential data from the new structure
  const { credential: credInfo } = verification.registrationInfo;
  const credentialID = credInfo.id;
  const credentialPublicKey = credInfo.publicKey;
  const counter = credInfo.counter;
  
  if (!credentialID || !credentialPublicKey) {
    return NextResponse.json({ error: 'MISSING_CREDENTIAL_DATA' }, { status: 400 });
  }
  const transports = credInfo.transports;
  // credentialID is already a base64url string in the new format
  const credIdB64 = credentialID;
  const pubKeyB64 = Buffer.from(credentialPublicKey).toString('base64url');
  await prisma.webAuthnCredential.upsert({
    where: { credentialId: credIdB64 },
    update: { publicKey: pubKeyB64, counter, name, transports: transports?.join(',') },
    create: { userId, credentialId: credIdB64, publicKey: pubKeyB64, counter, name, transports: transports?.join(',') },
  });
  await prisma.webAuthnChallenge.deleteMany({ where: { userId, type: 'registration' } });
  return NextResponse.json({ ok: true });
}
