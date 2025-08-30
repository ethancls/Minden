-- AlterTable
ALTER TABLE "public"."WebAuthnCredential" ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT;
