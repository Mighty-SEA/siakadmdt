-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NULL,
    `gender` VARCHAR(191) NOT NULL,
    `is_alumni` BOOLEAN NULL DEFAULT false,
    `nik` VARCHAR(191) NULL,
    `kk` VARCHAR(191) NULL,
    `father_name` VARCHAR(191) NULL,
    `mother_name` VARCHAR(191) NULL,
    `father_job` VARCHAR(191) NULL,
    `mother_job` VARCHAR(191) NULL,
    `origin_school` VARCHAR(191) NULL,
    `nisn` VARCHAR(191) NULL,
    `birth_place` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `qr_token` VARCHAR(191) NULL,

    UNIQUE INDEX `Student_nis_key`(`nis`),
    UNIQUE INDEX `Student_nik_key`(`nik`),
    UNIQUE INDEX `Student_nisn_key`(`nisn`),
    UNIQUE INDEX `Student_qr_token_key`(`qr_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
