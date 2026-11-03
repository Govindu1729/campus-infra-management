-- DropForeignKey
ALTER TABLE `calendar_audit_log` DROP FOREIGN KEY `calendar_audit_log_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `event_participants` DROP FOREIGN KEY `event_participants_eventId_fkey`;

-- DropIndex
DROP INDEX `service_keys_keyHash_idx` ON `service_keys`;

-- AlterTable
ALTER TABLE `calendar_audit_log` DROP PRIMARY KEY,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `eventId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `calendar_events` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `description` VARCHAR(2000) NULL,
    MODIFY `eventType` ENUM('MEETING', 'TASK', 'REMINDER', 'DEADLINE', 'MILESTONE') NOT NULL DEFAULT 'MEETING',
    MODIFY `visibility` ENUM('PUBLIC', 'MODULE_ONLY', 'ADMIN_ONLY') NOT NULL DEFAULT 'PUBLIC',
    MODIFY `status` ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `event_participants` DROP PRIMARY KEY,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `eventId` INTEGER NOT NULL,
    MODIFY `role` ENUM('ORGANIZER', 'ATTENDEE', 'OPTIONAL') NOT NULL DEFAULT 'ATTENDEE',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `metadata` JSON NULL,
    MODIFY `purpose` ENUM('MEETING_ROOM', 'CLASSROOM', 'LAB', 'SEMINAR_HALL', 'BOARD_ROOM', 'OFFICE') NOT NULL DEFAULT 'MEETING_ROOM',
    MODIFY `capacity` INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE `service_keys` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `permissions` JSON NULL;

-- AlterTable
ALTER TABLE `user_module_permissions` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `positionTitle` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `reminders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `reminderType` ENUM('BEFORE_EVENT', 'DEADLINE_APPROACHING', 'TASK_OVERDUE', 'CUSTOM') NOT NULL,
    `minutesBefore` INTEGER NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'BOTH') NOT NULL DEFAULT 'IN_APP',
    `message` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reminders_scheduledAt_status_idx`(`scheduledAt`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipientId` INTEGER NOT NULL,
    `type` ENUM('REMINDER', 'DEADLINE_ALERT', 'TASK_ASSIGNED', 'TASK_OVERDUE', 'EVENT_UPDATE', 'CUSTOM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `eventId` INTEGER NULL,
    `taskId` INTEGER NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipientId_readAt_idx`(`recipientId`, `readAt`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sourceModule` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `deadline` DATETIME(3) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_sourceModule_idx`(`sourceModule`),
    INDEX `tasks_deadline_idx`(`deadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_assignees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `task_assignees_userId_idx`(`userId`),
    UNIQUE INDEX `task_assignees_taskId_userId_key`(`taskId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `functional_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `functional_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fic_contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `officialTitle` VARCHAR(191) NOT NULL,
    `primaryEmail` VARCHAR(191) NOT NULL,
    `secondaryEmails` VARCHAR(191) NULL,
    `voipNumber` VARCHAR(191) NULL,
    `officeLocation` VARCHAR(191) NULL,
    `systemRole` VARCHAR(191) NULL,
    `functionalCategoryId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `parentContactId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fic_contacts_primaryEmail_key`(`primaryEmail`),
    INDEX `fic_contacts_functionalCategoryId_idx`(`functionalCategoryId`),
    INDEX `fic_contacts_parentContactId_idx`(`parentContactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `calendar_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_module_permissions` ADD CONSTRAINT `user_module_permissions_grantedBy_fkey` FOREIGN KEY (`grantedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_audit_log` ADD CONSTRAINT `calendar_audit_log_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `calendar_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `calendar_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_assignees` ADD CONSTRAINT `task_assignees_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_assignees` ADD CONSTRAINT `task_assignees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fic_contacts` ADD CONSTRAINT `fic_contacts_functionalCategoryId_fkey` FOREIGN KEY (`functionalCategoryId`) REFERENCES `functional_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fic_contacts` ADD CONSTRAINT `fic_contacts_parentContactId_fkey` FOREIGN KEY (`parentContactId`) REFERENCES `fic_contacts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `calendar_audit_log` RENAME INDEX `calendar_audit_log_eventId_fkey` TO `calendar_audit_log_eventId_idx`;

-- RenameIndex
ALTER TABLE `event_participants` RENAME INDEX `event_participants_userId_fkey` TO `event_participants_userId_idx`;

