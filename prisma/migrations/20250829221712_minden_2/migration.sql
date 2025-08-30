/*
  Warnings:

  - You are about to drop the column `token` on the `AgentToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `AgentToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."AgentToken_token_key";

-- AlterTable
ALTER TABLE "public"."AgentToken" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT;

-- AlterTable
ALTER TABLE "public"."Machine" ADD COLUMN     "desiredServices" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "public"."Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentToken_tokenHash_key" ON "public"."AgentToken"("tokenHash");
