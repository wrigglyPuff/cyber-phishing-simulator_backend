/*
  Warnings:

  - You are about to drop the column `choices` on the `Scenario` table. All the data in the column will be lost.
  - You are about to drop the column `cues` on the `Scenario` table. All the data in the column will be lost.
  - Added the required column `correctAnswer` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctCues` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Scenario` DROP COLUMN `choices`,
    DROP COLUMN `cues`,
    ADD COLUMN `correctAnswer` JSON NOT NULL,
    ADD COLUMN `correctCues` JSON NOT NULL;
