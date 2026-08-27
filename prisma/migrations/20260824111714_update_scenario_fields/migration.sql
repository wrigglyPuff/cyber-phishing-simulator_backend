/*
  Warnings:

  - You are about to alter the column `interactionType` on the `Scenario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `Scenario` MODIFY `interactionType` ENUM('EMAIL', 'TEXT_MESSAGE', 'PHONE_CALL', 'SOCIAL_MEDIA') NOT NULL,
    MODIFY `sender` VARCHAR(250) NULL,
    MODIFY `recipient` VARCHAR(250) NULL,
    MODIFY `subject` VARCHAR(250) NULL;
