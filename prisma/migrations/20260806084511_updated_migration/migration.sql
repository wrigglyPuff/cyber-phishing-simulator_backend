/*
  Warnings:

  - Added the required column `recipient` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scenario` ADD COLUMN `recipient` VARCHAR(250) NOT NULL,
    ADD COLUMN `sender` VARCHAR(250) NOT NULL,
    ADD COLUMN `subject` VARCHAR(250) NOT NULL;
