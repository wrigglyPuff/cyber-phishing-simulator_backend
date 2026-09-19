/*
  Warnings:

  - Added the required column `moduleAttemptNumber` to the `ModuleResults` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ModuleResults` ADD COLUMN `moduleAttemptNumber` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `organisationId` INTEGER NOT NULL,
    `attemptsCount` INTEGER NOT NULL DEFAULT 0,
    `firstAttemptScore` INTEGER NULL,
    `firstCompletedAt` DATETIME(3) NULL,
    `latestAttemptScore` INTEGER NULL,
    `latestCompletedAt` DATETIME(3) NULL,
    `bestAttemptScore` INTEGER NULL,
    `improvementPoints` INTEGER NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `scenarios_completed` INTEGER NOT NULL DEFAULT 0,
    `total_scenarios` INTEGER NOT NULL DEFAULT 0,
    `passed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Analytics_moduleId_fkey`(`moduleId`),
    INDEX `Analytics_organisationId_idx`(`organisationId`),
    UNIQUE INDEX `Analytics_userId_moduleId_key`(`userId`, `moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Analytics` ADD CONSTRAINT `Analytics_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analytics` ADD CONSTRAINT `Analytics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
