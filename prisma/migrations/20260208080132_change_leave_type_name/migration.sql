/*
  Warnings:

  - You are about to drop the column `LeaveType` on the `leave` table. All the data in the column will be lost.
  - Added the required column `leaveType` to the `leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `leave` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leave` DROP COLUMN `LeaveType`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `leaveType` ENUM('annual', 'sick', 'special', 'official', 'unpaid') NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
