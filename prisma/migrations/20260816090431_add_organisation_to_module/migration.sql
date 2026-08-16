/*
  Warnings:

  - Added the required column `organisationId` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Module` ADD COLUMN `organisationId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Module_organisationId_fkey` ON `Module`(`organisationId`);

-- AddForeignKey
ALTER TABLE `Module` ADD CONSTRAINT `Module_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `Organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
