/*
  Warnings:

  - The `latitude` column on the `empresa` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `longitude` column on the `empresa` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `tipo` on the `empresa` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `empresa` DROP COLUMN `latitude`,
    ADD COLUMN `latitude` VARCHAR(20) NULL,
    DROP COLUMN `longitude`,
    ADD COLUMN `longitude` VARCHAR(20) NULL,
    MODIFY `tipo` ENUM('clinica', 'vistoria', 'detran') NULL;
