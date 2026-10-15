-- Confirmed sponsorship read model. No placement or member activation is performed.
CREATE TABLE `MemberSponsorLink` (
  `memberId` CHAR(36) NOT NULL,
  `sponsorId` CHAR(36) NOT NULL,
  `linkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`memberId`),
  INDEX `MemberSponsorLink_sponsorId_memberId_idx` (`sponsorId`, `memberId`),
  CONSTRAINT `MemberSponsorLink_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MemberSponsorLink_sponsorId_fkey` FOREIGN KEY (`sponsorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
