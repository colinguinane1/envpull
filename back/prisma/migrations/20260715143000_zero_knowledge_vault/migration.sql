-- AlterTable
ALTER TABLE "User" ALTER COLUMN "recoveryKeyHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "kdfParams" JSONB;
ALTER TABLE "User" ADD COLUMN "passwordWrapSalt" TEXT;
ALTER TABLE "User" ADD COLUMN "wrappedMkByPassword" TEXT;
ALTER TABLE "User" ADD COLUMN "recoveryWrapSalt" TEXT;
ALTER TABLE "User" ADD COLUMN "wrappedMkByRecovery" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_userId_slug_key" ON "Project"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EnvSnapshot_projectId_key" ON "EnvSnapshot"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvSnapshot" ADD CONSTRAINT "EnvSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
