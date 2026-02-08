/*
  Warnings:

  - You are about to alter the column `gram_per_pack` on the `packaging_specs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `target_amount_gram` on the `production_plans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `result_amount_gram` on the `production_plans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `packaging_specs` MODIFY `gram_per_pack` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `production_plans` MODIFY `target_amount_gram` INTEGER NOT NULL,
    MODIFY `result_amount_gram` INTEGER NULL;

-- CreateTable
CREATE TABLE `leave` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `totalDays` INTEGER NOT NULL,
    `status` ENUM('requested', 'approved', 'rejected') NOT NULL,
    `LeaveType` ENUM('annual', 'sick', 'special', 'official', 'unpaid') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leave` ADD CONSTRAINT `leave_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
