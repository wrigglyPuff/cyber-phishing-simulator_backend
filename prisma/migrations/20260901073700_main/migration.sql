-- CreateTable
CREATE TABLE `Organisation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organisation_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('GLOBAL_ADMIN', 'TRAINER', 'LEARNER') NOT NULL DEFAULT 'LEARNER',
    `organisationId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_organisationId_fkey`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Module` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organisationId` INTEGER NOT NULL,
    `assignedUsers` JSON NULL,

    INDEX `Module_organisationId_fkey`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scenario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `category` ENUM('PHISHING', 'SMISHING', 'VISHING', 'SOCIAL_ENGINEERING', 'MALWARE', 'RANSOMWARE', 'BUSINESS_EMAIL_COMPROMISE', 'SPEAR_PHISHING', 'WHALING') NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    `interactionType` ENUM('EMAIL', 'TEXT_MESSAGE', 'PHONE_CALL', 'SOCIAL_MEDIA') NOT NULL,
    `scenarioDescription` VARCHAR(1000) NOT NULL,
    `sender` VARCHAR(250) NULL,
    `recipient` VARCHAR(250) NULL,
    `subject` VARCHAR(250) NULL,
    `correctActionExplanation` VARCHAR(1000) NULL DEFAULT 'Explanations coming soon',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `correctAnswer` JSON NULL,
    `correctCues` JSON NOT NULL,

    INDEX `Scenario_moduleId_fkey`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScenarioAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleResultId` INTEGER NOT NULL,
    `scenarioId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `timeTakenSeconds` INTEGER NOT NULL,
    `attemptNumber` INTEGER NOT NULL,
    `response` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL,
    `selectedChoice` INTEGER NULL,
    `selectedChoiceText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cueSelections` JSON NULL,
    `missedCues` JSON NULL,

    INDEX `ScenarioAttempt_moduleResultId_fkey`(`moduleResultId`),
    INDEX `ScenarioAttempt_scenarioId_fkey`(`scenarioId`),
    INDEX `ScenarioAttempt_moduleId_fkey`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordresetToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_tokenHash_key`(`tokenHash`),
    INDEX `RefreshToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `Organisation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Module` ADD CONSTRAINT `Module_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `Organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_moduleResultId_fkey` FOREIGN KEY (`moduleResultId`) REFERENCES `ModuleResults`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioAttempt` ADD CONSTRAINT `ScenarioAttempt_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleResults` ADD CONSTRAINT `ModuleResults_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleResults` ADD CONSTRAINT `ModuleResults_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
