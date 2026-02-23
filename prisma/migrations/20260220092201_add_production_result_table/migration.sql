-- CreateTable
CREATE TABLE `production_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `production_plan_id` INTEGER NOT NULL,
    `box_count` INTEGER NOT NULL,
    `packs_per_box` INTEGER NOT NULL,
    `remaining_pack_count` INTEGER NOT NULL,
    `total_pack_count` INTEGER NOT NULL,
    `total_amount_gram` INTEGER NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_results_production_plan_id_key`(`production_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `production_results` ADD CONSTRAINT `production_results_production_plan_id_fkey` FOREIGN KEY (`production_plan_id`) REFERENCES `production_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_results` ADD CONSTRAINT `production_results_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
