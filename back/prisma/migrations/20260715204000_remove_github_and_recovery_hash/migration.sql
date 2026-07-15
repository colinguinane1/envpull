-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "recoveryKeyHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "githubId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "githubAccessToken";
