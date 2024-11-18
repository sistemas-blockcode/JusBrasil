/*
  Warnings:

  - You are about to drop the column `linkProcesso` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "linkProcesso",
ADD COLUMN     "linkProcessos" TEXT[];
