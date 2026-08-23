/*
  Warnings:

  - The values [CREDENTIAL_THEFT,INVOICE_FRAUD,DELIVERY_SCAM,AUTHORITY_IMPRESONATION,ATTACHMENT_MALWARE,INTERNAL_MESSAGE_IMPERSONATION] on the enum `Scenario_category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attemptId` on the `ScenarioAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `choiceId` on the `ScenarioAttempt` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the `AssignedModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CueSelection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MissedCue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScenarioChoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScenarioCue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `choices` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cues` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleResultId` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AssignedModule` DROP FOREIGN KEY `AssignedModule_moduleId_fkey`;

-- DropForeignKey
ALTER TABLE `AssignedModule` DROP FOREIGN KEY `AssignedModule_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Attempt` DROP FOREIGN KEY `Attempt_moduleId_fkey`;

-- DropForeignKey
ALTER TABLE `Attempt` DROP FOREIGN KEY `Attempt_userId_fkey`;

-- DropForeignKey
ALTER TABLE `CueSelection` DROP FOREIGN KEY `CueSelection_cueId_fkey`;

-- DropForeignKey
ALTER TABLE `CueSelection` DROP FOREIGN KEY `CueSelection_scenarioAttemptId_fkey`;

-- DropForeignKey
ALTER TABLE `MissedCue` DROP FOREIGN KEY `MissedCue_cueId_fkey`;

-- DropForeignKey
ALTER TABLE `MissedCue` DROP FOREIGN KEY `MissedCue_scenarioAttemptId_fkey`;

-- DropForeignKey
ALTER TABLE `Results` DROP FOREIGN KEY `Results_moduleId_fkey`;

-- DropForeignKey
ALTER TABLE `Results` DROP FOREIGN KEY `Results_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ScenarioAttempt` DROP FOREIGN KEY `ScenarioAttempt_attemptId_fkey`;

-- DropForeignKey
ALTER TABLE `ScenarioAttempt` DROP FOREIGN KEY `ScenarioAttempt_choiceId_fkey`;

-- DropForeignKey
ALTER TABLE `ScenarioChoice` DROP FOREIGN KEY `ScenarioChoice_scenarioId_fkey`;

-- DropForeignKey
ALTER TABLE `ScenarioCue` DROP FOREIGN KEY `ScenarioCue_scenarioId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_organisationId_fkey`;

-- DropIndex
DROP INDEX `ScenarioAttempt_attemptId_fkey` ON `ScenarioAttempt`;

-- DropIndex
DROP INDEX `ScenarioAttempt_choiceId_fkey` ON `ScenarioAttempt`;

-- AlterTable
ALTER TABLE `Module` ADD COLUMN `assignedUsers` JSON NULL;

-- AlterTable
ALTER TABLE `Scenario` ADD COLUMN `choices` JSON NOT NULL,
    ADD COLUMN `cues` JSON NOT NULL,
    MODIFY `category` ENUM('PHISHING', 'SMISHING', 'VISHING', 'SOCIAL_ENGINEERING', 'MALWARE', 'RANSONWARE', 'BUISINESS_EMAIL_COMPROMISE', 'SPEAR_PHISHING', 'WHALING') NOT NULL;

-- AlterTable
ALTER TABLE `ScenarioAttempt` DROP COLUMN `attemptId`,
    DROP COLUMN `choiceId`,
    ADD COLUMN `cueSelections` JSON NULL,
    ADD COLUMN `missedCues` JSON NULL,
    ADD COLUMN `moduleId` INTEGER NOT NULL,
    ADD COLUMN `moduleResultId` INTEGER NOT NULL,
    ADD COLUMN `selectedChoice` INTEGER NULL,
    ADD COLUMN `selectedChoiceText` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('GLOBAL_ADMIN', 'TRAINER', 'LEARNER') NOT NULL DEFAULT 'LEARNER',
    MODIFY `organisationId` INTEGER NULL;

-- DropTable
DROP TABLE `AssignedModule`;

-- DropTable
DROP TABLE `Attempt`;

-- DropTable
DROP TABLE `CueSelection`;

-- DropTable
DROP TABLE `MissedCue`;

-- DropTable
DROP TABLE `Results`;

-- DropTable
DROP TABLE `ScenarioChoice`;

-- DropTable
DROP TABLE `ScenarioCue`;

-- CreateTable
CREATE TABLE `ModuleResults` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `organisationId` INTEGER NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `total_score` INTEGER NOT NULL,
    `max_possible_score` INTEGER NOT NULL,
    `percentage_score` INTEGER NOT NULL,
    `scenarios_completed` INTEGER NOT NULL,
    `total_scenarios` INTEGER NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `feedback` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ModuleResults_userId_fkey`(`userId`),
    INDEX `ModuleResults_moduleId_fkey`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ScenarioAttempt_moduleResultId_fkey` ON `ScenarioAttempt`(`moduleResultId`);

-- CreateIndex
CREATE INDEX `ScenarioAttempt_moduleId_fkey` ON `ScenarioAttempt`(`moduleId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `Organisation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_moduleResultId_fkey` FOREIGN KEY (`moduleResultId`) REFERENCES `ModuleResults`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleResults` ADD CONSTRAINT `ModuleResults_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleResults` ADD CONSTRAINT `ModuleResults_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
