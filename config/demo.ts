/**
 * Reference fixtures transcribed from the client's app.js and login.html.
 * PUBLIC DEMO ONLY: never use as an authentication source or seed into production.
 */
export const demoPassword = "Demo@123";
export const demoUsers = {
  member: { label: "Member", email: "member@mlmforum.demo" },
  business: { label: "Business Partner", email: "business@mlmforum.demo" },
  expert: { label: "Expert / Author", email: "expert@mlmforum.demo" },
  organizer: { label: "Event Organizer", email: "organizer@mlmforum.demo" },
  advertiser: { label: "Advertiser", email: "advertiser@mlmforum.demo" },
  moderator: { label: "Moderator", email: "moderator@mlmforum.demo" },
  admin: { label: "Administrator", email: "admin@mlmforum.demo" }
} as const;
export type DemoRole = keyof typeof demoUsers;
export const demoRegistrationRoles: DemoRole[] = ["member", "business", "expert", "organizer", "advertiser"];
export const demoSponsors: Record<string, string> = {
  "MLM-1001": "Ravi Kumar", "MLM-1002": "Anita Rao",
  "MLM-1003": "Suresh Patil", "MLM-1004": "Meena Shah",
  "MLM-1005": "Arjun Das", "MLM-1006": "Kavya Nair",
  "MLM-1007": "Imran Ali", "MLM-1008": "Priya Menon",
  "MLM-1009": "Rahul Verma", "MLM-1010": "Fatima Khan"
};
export const interests = ["Network Marketing", "Business Opportunities", "Training & Learning", "Products & Services", "Leadership"] as const;
export function isDemoRole(value: string): value is DemoRole {
  return Object.prototype.hasOwnProperty.call(demoUsers, value);
}
export function getSponsorName(value: string): string | undefined {
  return demoSponsors[value.trim().toUpperCase()];
}
export function validIndianMobile(value: string): boolean {
  return /^[6-9][0-9]{9}$/.test(value.trim());
}
export function matchesDemoCredentials(role: DemoRole, email: string, password: string): boolean {
  return email.trim().toLowerCase() === demoUsers[role].email && password === demoPassword;
}
