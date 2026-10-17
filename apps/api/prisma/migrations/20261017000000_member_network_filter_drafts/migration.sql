-- Per-member saved My Network filters; no new downline or contact workflow.
CREATE TABLE `MemberNetworkFilterDraft` (
  `memberId` CHAR(36) NOT NULL,
  `joinedFrom` DATETIME(3) NULL,
  `joinedTo` DATETIME(3) NULL,
  `searchTerm` VARCHAR(100) NOT NULL DEFAULT '',
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`memberId`),
  CONSTRAINT `MemberNetworkFilterDraft_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `User`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
