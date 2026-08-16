/*
  Warnings:

  - Added the required column `recipient` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeTakenSeconds` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Scenario` ADD COLUMN `recipient` VARCHAR(250) NOT NULL,
    ADD COLUMN `sender` VARCHAR(250) NOT NULL,
    ADD COLUMN `subject` VARCHAR(250) NOT NULL;

-- AlterTable
ALTER TABLE `ScenarioAttempt` ADD COLUMN `timeTakenSeconds` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `MissedCue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scenarioAttemptId` INTEGER NOT NULL,
    `cueId` INTEGER NOT NULL,

    INDEX `MissedCue_scenarioAttemptId_fkey`(`scenarioAttemptId`),
    INDEX `MissedCue_cueId_fkey`(`cueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MissedCue` ADD CONSTRAINT `MissedCue_scenarioAttemptId_fkey` FOREIGN KEY (`scenarioAttemptId`) REFERENCES `ScenarioAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MissedCue` ADD CONSTRAINT `MissedCue_cueId_fkey` FOREIGN KEY (`cueId`) REFERENCES `ScenarioCue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
