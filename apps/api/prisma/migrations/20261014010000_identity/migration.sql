-- Append-only identity foundation. No active users or financial tables are seeded.
CREATE TABLE `User` (
  `id` CHAR(36) NOT NULL,
  `memberCode` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `mobile` VARCHAR(10) NOT NULL,
  `passwordHash` VARCHAR(255) NULL,
  `status` ENUM('PENDING','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `mobileVerifiedAt` DATETIME(3) NULL,
  `emailVerifiedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `User_memberCode_key`(`memberCode`),
  UNIQUE INDEX `User_email_key`(`email`),
  UNIQUE INDEX `User_mobile_key`(`mobile`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `UserRole` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `role` ENUM('MEMBER','BUSINESS','EXPERT','ORGANIZER','ADVERTISER','MODERATOR','ADMIN') NOT NULL,
  UNIQUE INDEX `UserRole_userId_role_key`(`userId`,`role`),
  PRIMARY KEY (`id`),
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `Session` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `refreshHash` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  INDEX `Session_userId_revokedAt_idx`(`userId`,`revokedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `RegistrationRequest` (
  `id` CHAR(36) NOT NULL,
  `fullName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `mobile` VARCHAR(10) NOT NULL,
  `sponsorId` CHAR(36) NOT NULL,
  `requestedRole` ENUM('MEMBER','BUSINESS','EXPERT','ORGANIZER','ADVERTISER','MODERATOR','ADMIN') NOT NULL,
  `interest` VARCHAR(100) NOT NULL,
  `consentVersion` VARCHAR(60) NOT NULL,
  `consentRecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` ENUM('PENDING_VERIFICATION','REJECTED','APPROVED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `RegistrationRequest_email_key`(`email`),
  UNIQUE INDEX `RegistrationRequest_mobile_key`(`mobile`),
  INDEX `RegistrationRequest_sponsorId_status_idx`(`sponsorId`,`status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `RegistrationRequest_sponsorId_fkey` FOREIGN KEY (`sponsorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
