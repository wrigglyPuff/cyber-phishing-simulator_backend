/*
  Warnings:

  - Added the required column `attemptNumber` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedAt` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `ScenarioAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ScenarioAttempt` ADD COLUMN `attemptNumber` INTEGER NOT NULL,
    ADD COLUMN `completedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `response` VARCHAR(191) NOT NULL,
    ADD COLUMN `score` INTEGER NOT NULL,
    ADD COLUMN `startedAt` DATETIME(3) NOT NULL;
