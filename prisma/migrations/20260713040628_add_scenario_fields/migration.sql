/*
  Warnings:

  - You are about to drop the column `choiceId` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `scenarioId` on the `Attempt` table. All the data in the column will be lost.
  - Added the required column `moduleId` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scenariosTotal` to the `Results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interactionType` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scenarioDescription` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Attempt` DROP FOREIGN KEY `Attempt_choiceId_fkey`;

-- DropForeignKey
ALTER TABLE `Attempt` DROP FOREIGN KEY `Attempt_scenarioId_fkey`;

-- DropIndex
DROP INDEX `Attempt_choiceId_fkey` ON `Attempt`;

-- DropIndex
DROP INDEX `Attempt_scenarioId_fkey` ON `Attempt`;

-- AlterTable
ALTER TABLE `Attempt` DROP COLUMN `choiceId`,
    DROP COLUMN `isCorrect`,
    DROP COLUMN `scenarioId`,
    ADD COLUMN `moduleId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Results` ADD COLUMN `scenariosTotal` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Scenario` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `difficulty` VARCHAR(191) NOT NULL,
    ADD COLUMN `interactionType` VARCHAR(191) NOT NULL,
    ADD COLUMN `scenarioDescription` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AssignedModule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssignedModule_userId_fkey`(`userId`),
    INDEX `AssignedModule_moduleId_fkey`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScenarioCue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scenarioId` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,

    INDEX `ScenarioCue_scenarioId_fkey`(`scenarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScenarioAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `scenarioId` INTEGER NOT NULL,
    `choiceId` INTEGER NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ScenarioAttempt_attemptId_fkey`(`attemptId`),
    INDEX `ScenarioAttempt_scenarioId_fkey`(`scenarioId`),
    INDEX `ScenarioAttempt_choiceId_fkey`(`choiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CueSelection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scenarioAttemptId` INTEGER NOT NULL,
    `cueId` INTEGER NOT NULL,

    INDEX `CueSelection_scenarioAttemptId_fkey`(`scenarioAttemptId`),
    INDEX `CueSelection_cueId_fkey`(`cueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Attempt_moduleId_fkey` ON `Attempt`(`moduleId`);

-- AddForeignKey
ALTER TABLE `AssignedModule` ADD CONSTRAINT `AssignedModule_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignedModule` ADD CONSTRAINT `AssignedModule_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioCue` ADD CONSTRAINT `ScenarioCue_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `Attempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_choiceId_fkey` FOREIGN KEY (`choiceId`) REFERENCES `ScenarioChoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CueSelection` ADD CONSTRAINT `CueSelection_scenarioAttemptId_fkey` FOREIGN KEY (`scenarioAttemptId`) REFERENCES `ScenarioAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CueSelection` ADD CONSTRAINT `CueSelection_cueId_fkey` FOREIGN KEY (`cueId`) REFERENCES `ScenarioCue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
