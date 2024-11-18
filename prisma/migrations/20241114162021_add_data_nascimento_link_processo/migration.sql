/*
  Warnings:

  - Added the required column `dataNascimento` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkProcesso` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "dataNascimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "linkProcesso" TEXT NOT NULL;
