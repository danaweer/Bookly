/*
  Warnings:

  - The values [WISHLIST] on the enum `BookStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookStatus_new" AS ENUM ('PLANNING', 'READING', 'COMPLETED');
ALTER TABLE "public"."ReadListItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReadListItem" ALTER COLUMN "status" TYPE "BookStatus_new" USING ("status"::text::"BookStatus_new");
ALTER TYPE "BookStatus" RENAME TO "BookStatus_old";
ALTER TYPE "BookStatus_new" RENAME TO "BookStatus";
DROP TYPE "public"."BookStatus_old";
ALTER TABLE "ReadListItem" ALTER COLUMN "status" SET DEFAULT 'PLANNING';
COMMIT;

-- AlterTable
ALTER TABLE "ReadListItem" ALTER COLUMN "status" SET DEFAULT 'PLANNING';
