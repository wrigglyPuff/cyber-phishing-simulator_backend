/*
  Warnings:

  - You are about to alter the column `category` on the `Scenario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `difficulty` on the `Scenario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - Added the required column `tag` to the `ScenarioCue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Scenario` MODIFY `category` ENUM('CREDENTIAL_THEFT', 'INVOICE_FRAUD', 'DELIVERY_SCAM', 'AUTHORITY_IMPRESONATION', 'ATTACHMENT_MALWARE', 'SMISHING', 'INTERNAL_MESSAGE_IMPERSONATION') NOT NULL,
    MODIFY `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL;

-- AlterTable
ALTER TABLE `ScenarioCue` ADD COLUMN `tag` ENUM('URGENCY', 'MISMATCHED_DOMAIN', 'UNEXPECTED_ATTACHMENT', 'SUSPICIOUS_LINK', 'AUTHORITY_IMPERSONATION', 'SPELLING_GRAMMAR', 'GENERIC_GREETING', 'OTHER') NOT NULL;
