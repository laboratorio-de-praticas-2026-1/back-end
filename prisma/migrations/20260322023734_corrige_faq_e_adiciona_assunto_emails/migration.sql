/*
  Warnings:

  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assunto` to the `emails_enviados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `emails_enviados` ADD COLUMN `assunto` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `faq` ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `FAQ`;
