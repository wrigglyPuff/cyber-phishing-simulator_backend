-- CreateTable
CREATE TABLE `AiOutputLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generatedById` INTEGER NOT NULL,
    `moduleId` INTEGER NULL,
    `scenarioId` INTEGER NULL,
    `prompt` VARCHAR(1000) NOT NULL,
    `output` TEXT NOT NULL,
    `isSafe` BOOLEAN NOT NULL DEFAULT true,
    `flaggedReason` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AiOutputLog` ADD CONSTRAINT `AiOutputLog_generatedById_fkey` FOREIGN KEY (`generatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiOutputLog` ADD CONSTRAINT `AiOutputLog_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiOutputLog` ADD CONSTRAINT `AiOutputLog_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
