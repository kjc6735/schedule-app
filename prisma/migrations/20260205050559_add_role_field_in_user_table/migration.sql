-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('onwer', 'manage', 'worker') NOT NULL DEFAULT 'worker';
