import {UserStatus} from "@prisma/client";

// Conservative privacy gate already applied by Genealogy.
// This is NOT the approved active-member/commission eligibility policy.
export const visibleConfirmedMember={
  status:UserStatus.ACTIVE,
  mobileVerifiedAt:{not:null}
} as const;
